/* Fills the detail-page fields for Romal Kirti with the structure it needs.
   The values are the ones we already had on the card plus clearly-marked
   placeholders — edit them in the Studio.
     npx sanity exec scripts/seed-romal.mjs --with-user-token              */
import {getCliClient} from 'sanity/cli'

const client = getCliClient()
const doc = await client.fetch('*[_type=="project" && slug.current=="romal-kirti"][0]{_id}')
if (!doc) { console.error('no document with slug "romal-kirti"'); process.exit(1) }

await client.patch(doc._id).set({
  overview:
    'is a commercial address in Nalasopara West — efficient floor plates, ' +
    'straightforward access and specification chosen to last.',
  specs: [
    {_key: 's1', label: 'Total Area', value: '[Plot area]'},
    {_key: 's2', label: 'Towers', value: '[Number]'},
    {_key: 's3', label: 'Units', value: '[Number]'},
    {_key: 's4', label: 'Possession', value: 'Completed'},
    {_key: 's5', label: 'Architects', value: '[Practice name]'},
    {_key: 's6', label: 'RERA', value: '[Registration no.]'},
  ],
  amenities: [
    {_key: 'a1', icon: 'parking', label: 'Covered Parking'},
    {_key: 'a2', icon: 'security', label: '24×7 Security'},
    {_key: 'a3', icon: 'lift', label: 'High-Speed Lifts'},
    {_key: 'a4', icon: 'power', label: 'Power Backup'},
    {_key: 'a5', icon: 'planning', label: 'Efficient Planning'},
  ],
  address: 'Romal Kirti,\n[Plot & street],\nNalasopara West 401 203',
  landmarks: [
    {_key: 'l1', label: 'Nalasopara Station', distance: '[km]'},
    {_key: 'l2', label: 'Western Express Highway', distance: '[km]'},
    {_key: 'l3', label: 'Schools', distance: '[km]'},
    {_key: 'l4', label: 'Hospital', distance: '[km]'},
  ],
}).unset(['detailUrl']).commit()

console.log('Romal Kirti detail fields written')
