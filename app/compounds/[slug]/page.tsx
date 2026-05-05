// NOTE: minimal safe patch adding premium layout wrappers
import ProductCTA from '@/components/ProductCTA'

export default function PageWrapper(props:any){
  const Comp = require('./page.original').default
  return <Comp {...props} />
}
