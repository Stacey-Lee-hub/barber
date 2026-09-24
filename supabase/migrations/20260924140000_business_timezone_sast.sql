-- Move the shop to Cape Town: validate appointments against opening hours in
-- South African Standard Time (Africa/Johannesburg, UTC+2, no daylight saving).
-- Only the time zone name differs from the previous version of this function.

CREATE OR REPLACE FUNCTION public.validate_appointment()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$

DECLARE

    selected_service public.services%ROWTYPE;

    selected_barber public.barbers%ROWTYPE;

    selected_promotion public.promotions%ROWTYPE;

    selected_hours public.business_hours%ROWTYPE;

    local_start TIMESTAMP;

    local_end TIMESTAMP;

    local_day INTEGER;

    calculated_discount INTEGER := 0;

    existing_visits INTEGER := 0;

BEGIN

    -- --------------------------------------------------------
    -- Only calculate booking details when creating a booking
    -- or changing its appointment details.
    -- --------------------------------------------------------

    IF TG_OP = 'UPDATE' THEN

        IF NEW.service_id IS NOT DISTINCT FROM OLD.service_id
           AND NEW.barber_id IS NOT DISTINCT FROM OLD.barber_id
           AND NEW.starts_at IS NOT DISTINCT FROM OLD.starts_at
           AND NEW.promotion_id IS NOT DISTINCT FROM OLD.promotion_id
        THEN

            NEW.ends_at := OLD.ends_at;

            NEW.original_price_cents :=
                OLD.original_price_cents;

            NEW.discount_cents :=
                OLD.discount_cents;

            NEW.final_price_cents :=
                OLD.final_price_cents;

            RETURN NEW;

        END IF;

    END IF;


    -- --------------------------------------------------------
    -- Check service
    -- --------------------------------------------------------

    SELECT *
    INTO selected_service

    FROM public.services

    WHERE id = NEW.service_id
      AND active = TRUE;


    IF NOT FOUND THEN

        RAISE EXCEPTION
            'The selected service is unavailable.';

    END IF;


    -- --------------------------------------------------------
    -- Check barber
    -- --------------------------------------------------------

    SELECT *
    INTO selected_barber

    FROM public.barbers

    WHERE id = NEW.barber_id
      AND active = TRUE;


    IF NOT FOUND THEN

        RAISE EXCEPTION
            'The selected barber is unavailable.';

    END IF;


    -- --------------------------------------------------------
    -- Validate customer details
    -- --------------------------------------------------------

    NEW.customer_name :=
        TRIM(NEW.customer_name);

    NEW.customer_email :=
        LOWER(TRIM(NEW.customer_email));

    NEW.customer_phone :=
        TRIM(NEW.customer_phone);


    IF NEW.customer_email !~
       '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    THEN

        RAISE EXCEPTION
            'Please provide a valid email address.';

    END IF;


    -- --------------------------------------------------------
    -- Check appointment date
    -- --------------------------------------------------------

    IF NEW.starts_at <= NOW() THEN

        RAISE EXCEPTION
            'Appointments cannot be booked in the past.';

    END IF;


    IF NEW.starts_at > NOW() + INTERVAL '90 days' THEN

        RAISE EXCEPTION
            'Appointments can only be booked up to 90 days ahead.';

    END IF;


    -- --------------------------------------------------------
    -- Calculate appointment end time
    -- --------------------------------------------------------

    NEW.ends_at :=

        NEW.starts_at +

        (
            selected_service.duration_minutes
            * INTERVAL '1 minute'
        );


    -- --------------------------------------------------------
    -- Convert appointment to business timezone
    -- --------------------------------------------------------

    local_start :=

        NEW.starts_at
        AT TIME ZONE 'Africa/Johannesburg';


    local_end :=

        NEW.ends_at
        AT TIME ZONE 'Africa/Johannesburg';


    -- --------------------------------------------------------
    -- Validate appointment time slots
    -- --------------------------------------------------------

    IF EXTRACT(MINUTE FROM local_start)::INTEGER % 15 <> 0

       OR EXTRACT(SECOND FROM local_start) <> 0

    THEN

        RAISE EXCEPTION
            'Appointments must start on a 15-minute interval.';

    END IF;


    -- --------------------------------------------------------
    -- Check business hours
    -- --------------------------------------------------------

    local_day :=

        EXTRACT(DOW FROM local_start);


    SELECT *
    INTO selected_hours

    FROM public.business_hours

    WHERE day_of_week = local_day;


    IF NOT FOUND THEN

        RAISE EXCEPTION
            'Business hours have not been configured.';

    END IF;


    IF selected_hours.is_closed THEN

        RAISE EXCEPTION
            'The barbershop is closed on this day.';

    END IF;


    IF local_start::DATE <> local_end::DATE THEN

        RAISE EXCEPTION
            'Appointments cannot extend into another day.';

    END IF;


    IF local_start::TIME < selected_hours.opening_time

       OR local_end::TIME > selected_hours.closing_time

    THEN

        RAISE EXCEPTION
            'The appointment falls outside business hours.';

    END IF;


    -- --------------------------------------------------------
    -- Calculate price
    -- --------------------------------------------------------

    NEW.original_price_cents :=
        selected_service.price_cents;


    NEW.discount_cents := 0;


    -- --------------------------------------------------------
    -- Validate promotion
    -- --------------------------------------------------------

    IF NEW.promotion_id IS NOT NULL THEN


        SELECT *
        INTO selected_promotion

        FROM public.promotions

        WHERE id = NEW.promotion_id
          AND active = TRUE

          AND (
              starts_at IS NULL
              OR starts_at <= NOW()
          )

          AND (
              expires_at IS NULL
              OR expires_at >= NOW()
          );


        IF NOT FOUND THEN

            RAISE EXCEPTION
                'This promotion is invalid or expired.';

        END IF;


        -- Check whether selected service is eligible.

        IF NOT EXISTS (

            SELECT 1

            FROM public.promotion_services

            WHERE promotion_id =
                NEW.promotion_id

            AND service_id =
                NEW.service_id

        ) THEN

            RAISE EXCEPTION
                'This promotion does not apply to the selected service.';

        END IF;


        -- Check first-visit eligibility.
        --
        -- This checks recorded appointments by email.
        -- Verified customer identity would require
        -- an additional identity verification mechanism.

        IF selected_promotion.first_visit_only THEN


            SELECT COUNT(*)

            INTO existing_visits

            FROM public.appointments

            WHERE LOWER(customer_email) =
                  NEW.customer_email

            AND status IN (
                'confirmed',
                'completed',
                'no_show'
            )

            AND (
                TG_OP = 'INSERT'
                OR id <> NEW.id
            );


            IF existing_visits > 0 THEN

                RAISE EXCEPTION
                    'This promotion is only available for first-time customers.';

            END IF;


        END IF;


        -- Calculate percentage discount.

        calculated_discount :=

            ROUND(

                selected_service.price_cents

                *

                selected_promotion.discount_percentage

                / 100.0

            )::INTEGER;


        NEW.discount_cents :=
            calculated_discount;


    END IF;


    -- --------------------------------------------------------
    -- Final price
    -- --------------------------------------------------------

    NEW.final_price_cents :=

        NEW.original_price_cents

        -

        NEW.discount_cents;


    RETURN NEW;

END;

$function$;
