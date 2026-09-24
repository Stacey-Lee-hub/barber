import { Check, Clock, Users } from 'lucide-react'
import BarberPortrait from '../barbers/BarberPortrait'
import { formatDuration, formatPrice } from '../../lib/format'
import { ANY_BARBER } from '../../lib/bookingFlow'

export function ServiceStep({ services, selectedId, onSelect }) {
  return (
    <fieldset className="choice-group">
      <legend className="step-title">Choose your service</legend>
      <div className="choice-list">
        {services.map((service) => {
          const checked = service.id === selectedId
          return (
            <label key={service.id} className={`choice choice--service ${checked ? 'is-checked' : ''}`}>
              <input
                type="radio"
                name="service"
                value={service.id}
                checked={checked}
                onChange={() => onSelect(service.id)}
                className="visually-hidden"
              />
              <span className="choice__check" aria-hidden="true">
                {checked && <Check />}
              </span>
              <span className="choice__body">
                <span className="choice__eyebrow">{service.category}</span>
                <span className="choice__title">{service.name}</span>
                <span className="choice__desc">{service.description}</span>
              </span>
              <span className="choice__meta">
                <span className="choice__price">{formatPrice(service.price_cents)}</span>
                <span className="choice__duration">
                  <Clock aria-hidden="true" />
                  {formatDuration(service.duration_minutes)}
                </span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export function BarberStep({ barbers, selectedId, onSelect }) {
  return (
    <fieldset className="choice-group">
      <legend className="step-title">Choose your barber</legend>
      <div className="choice-grid">
        <label className={`choice choice--barber choice--any ${selectedId === ANY_BARBER ? 'is-checked' : ''}`}>
          <input
            type="radio"
            name="barber"
            value={ANY_BARBER}
            checked={selectedId === ANY_BARBER}
            onChange={() => onSelect(ANY_BARBER)}
            className="visually-hidden"
          />
          <span className="choice__any-icon" aria-hidden="true">
            <Users />
          </span>
          <span className="choice__body">
            <span className="choice__title">Any Available Barber</span>
            <span className="choice__desc">Shows every open time across the team — we’ll confirm who you’re with.</span>
          </span>
          <span className="choice__check" aria-hidden="true">
            {selectedId === ANY_BARBER && <Check />}
          </span>
        </label>
        {barbers.map((barber) => {
          const checked = barber.id === selectedId
          return (
            <label key={barber.id} className={`choice choice--barber ${checked ? 'is-checked' : ''}`}>
              <input
                type="radio"
                name="barber"
                value={barber.id}
                checked={checked}
                onChange={() => onSelect(barber.id)}
                className="visually-hidden"
              />
              <BarberPortrait barber={barber} className="choice__portrait" decorative />
              <span className="choice__body">
                <span className="choice__eyebrow">{barber.role}</span>
                <span className="choice__title">{barber.name}</span>
                <span className="choice__desc">{barber.specialty}</span>
              </span>
              <span className="choice__check" aria-hidden="true">
                {checked && <Check />}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
