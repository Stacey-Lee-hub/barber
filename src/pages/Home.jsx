import Hero from '../components/home/Hero'
import FeaturedServices from '../components/home/FeaturedServices'
import {
  Craft,
  ExecutivePackage,
  FinalCta,
  FirstVisitOffer,
  Introduction,
  MeetTheBarbers,
} from '../components/home/HomeSections'
import useDocumentMeta from '../hooks/useDocumentMeta'

export default function Home() {
  useDocumentMeta(
    null,
    'Premium grooming and classic barbering for the modern gentleman. Precision cuts, skin fades, beard sculpting and hot towel shaves in Cape Town City Centre. Book online.',
  )

  return (
    <>
      <Hero />
      <Introduction />
      <FeaturedServices />
      <Craft />
      <MeetTheBarbers />
      <ExecutivePackage />
      <FirstVisitOffer />
      <FinalCta />
    </>
  )
}
