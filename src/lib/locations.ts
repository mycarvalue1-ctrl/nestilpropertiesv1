export type Locality = {
  name: string;
};

export type District = {
  name: string;
  localities: Locality[];
};

export type State = {
  name: string;
  districts: District[];
};

// This static data is no longer the primary source for the location selector, 
// but can be kept as a fallback or for other purposes.
export const locationData: State[] = [
  {
    name: 'Andhra Pradesh',
    districts: [
      { name: 'Alluri Sitharama Raju district', localities: [{ name: 'Paderu' }, { name: 'Chintapalle' }] },
      { name: 'Anakapalli district', localities: [{ name: 'Anakapalle Town' }, { name: 'Yelamanchili' }] },
      { name: 'Ananthapuramu district', localities: [{ name: 'Anantapur City' }, { name: 'Guntakal' }] },
      { name: 'Annamayya district', localities: [{ name: 'Rayachoti' }, { name: 'Madanapalle' }] },
      { name: 'Bapatla district', localities: [{ name: 'Bapatla Town' }, { name: 'Chirala' }] },
      { name: 'Chittoor district', localities: [{ name: 'Chittoor City' }, { name: 'Palamaner' }] },
      { name: 'Dr. B. R. Ambedkar Konaseema district', localities: [{ name: 'Amalapuram' }, { name: 'Razole' }] },
      { name: 'East Godavari district', localities: [{ name: 'Rajahmundry' }, { name: 'Kovvur' }] },
      { name: 'Eluru district', localities: [{ name: 'Eluru City' }, { name: 'Nuzvid' }] },
      { name: 'Guntur district', localities: [{ name: 'Guntur City' }, { name: 'Tenali' }] },
      { name: 'Kakinada district', localities: [{ name: 'Kakinada City' }, { name: 'Pithapuram' }] },
      { name: 'Krishna district', localities: [{ name: 'Machilipatnam' }, { name: 'Gudivada' }] },
      { name: 'Kurnool district', localities: [{ name: 'Kurnool City' }, { name: 'Adoni' }] },
      { name: 'Nandyal district', localities: [{ name: 'Nandyal Town' }, { name: 'Dhone' }] },
      { name: 'Nellore district', localities: [{ name: 'Nellore City' }, { name: 'Kavali' }] },
      { name: 'NTR district', localities: [{ name: 'Vijayawada' }, { name: 'Jaggayyapeta' }] },
      { name: 'Palnadu district', localities: [{ name: 'Narasaraopet' }, { name: 'Chilakaluripet' }] },
      { name: 'Parvathipuram Manyam district', localities: [{ name: 'Parvathipuram' }, { name: 'Salur' }] },
      { name: 'Prakasam district', localities: [{ name: 'Ongole' }, { name: 'Markapur' }] },
      { name: 'Sri Potti Sriramulu Nellore district', localities: [{ name: 'SPSR Nellore City' }, { name: 'Gudur' }] },
      { name: 'Sri Sathya Sai district', localities: [{ name: 'Puttaparthi' }, { name: 'Hindupur' }] },
      { name: 'Srikakulam district', localities: [{ name: 'Srikakulam Town' }, { name: 'Palasa' }] },
      { name: 'Tirupati district', localities: [{ name: 'Tirupati City' }, { name: 'Srikalahasti' }] },
      { name: 'Visakhapatnam district', localities: [{ name: 'Visakhapatnam City' }, { name: 'Gajuwaka' }] },
      { name: 'Vizianagaram district', localities: [{ name: 'Vizianagaram Town' }, { name: 'Bobbili' }] },
      { name: 'West Godavari district', localities: [{ name: 'Bhimavaram' }, { name: 'Tadepalligudem' }] },
    ],
  },
];
