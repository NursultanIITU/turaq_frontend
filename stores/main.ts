interface IFILTERS {
  object_types: String | Number[],
  deal_types: String | Number | null,
  tariff_types: String | Number | null,
  parking_space_sizes: String | Number | null,
  from_price: Number | null,
  to_price: Number | null,
  from_size: Number | null,
  to_size: Number | null,
  parking_types: Number | null,
  characteristics: Number[]
  parking_space_numbers: Number | String | null
}

export const useMainStore = defineStore('main', {
    state: () => ({ 
        search: '' as String,
        zoom: 16 as Number,
        center: [76.944764, 43.313597] as Number[] | String[],
        city: 0 as Number,
        myGeo: [] as Number[] | String[],
        distance: 10,
        filters: {
          object_types: [],
          deal_types: null,
          tariff_types: null,
          parking_space_sizes: null,
          from_price: null,
          to_price: null,
          from_size: null,
          to_size: null,
          characteristics: [],
          parking_types: 1,
          parking_space_numbers: null
        } as IFILTERS,
        setSearch: null,
        firstReset: false,
        loading: false
    }),
    actions: {
      
    },
  })