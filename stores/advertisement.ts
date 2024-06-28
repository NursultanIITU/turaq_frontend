import { useMainStore } from "~/stores/main";

interface IAdv {
  name: String,
  object_types: String | Number | null,
  deal_types: String | Number | null,
  tariff_types: String | Number | null,
  parking_space_numbers: String | Number | null,
  characteristics: any[],
  parking_space_sizes: String | Number | null,
  description?: String,
  price: Number | String | null,
  area: Number | String | null,
  city_name: String,
  city_id: Number,
  latitude: String | Number | null,
  longitude: String | Number | null,
  savedImages: String[],
  parking_types: Number | null,
}

interface IFilterDictionaryItem {
  id: Number,
  title?: String | null,
  name?: String | null,
  image_url?: String,
  top?: String,
  left?: String 
  width?: String,
  height?: String
}

interface IFilterDictionary {
  object_types: IFilterDictionaryItem[],
  deal_types: IFilterDictionaryItem[],
  tariff_types: IFilterDictionaryItem[],
  parking_space_sizes: IFilterDictionaryItem[],
  characteritics: IFilterDictionaryItem[],
  cities: IFilterDictionaryItem[],
}

export const useAdvStore = defineStore('adv', {
    state: () => ({ 
        search: '' as String, 
        zoom: 15 as Number,
        center: [76.944764, 43.313597] as Number[] | String[],
        city: 0 as Number,
        myGeo: [] as Number[] | String[],
        advCreate: {
          name: '',
          latitude: '',
          longitude: '',
          object_types: '1',
          deal_types: '3',
          tariff_types: '5',
          parking_space_numbers: '',
          characteristics: [],
          parking_space_sizes: '1',
          price: null,
          area: null,
          description: '',
          city_name: '',
          city_id: 0,
          savedImages: [],
          parking_types: 1
        } as IAdv,
        setSearch: null as any, 
        dictionaries: {} as IFilterDictionary,
        adv: null as any,
        advSearch: [],
        loading: false
    }),
    actions: {
      resetAdvParams () {
        this.advCreate.object_types = this.dictionaries.object_types[0]?.id
        this.advCreate.deal_types = this.dictionaries.deal_types[0]?.id
        this.advCreate.tariff_types = this.dictionaries.tariff_types[0]?.id
        this.advCreate.parking_space_sizes = this.dictionaries.parking_space_sizes[0]?.id 
        this.advCreate.parking_space_numbers = ''
        this.advCreate.characteristics = []
        this.advCreate.description = ''
        this.advCreate.city_name = this.dictionaries.cities[0]?.name || ''
        this.advCreate.city_id = Number(localStorage.getItem('city')) || this.dictionaries.cities[0]?.id || 0
        this.advCreate.price = null
        this.advCreate.area = null
        this.advCreate.name = ''
        this.advCreate.parking_types = 1
        this.center = [76.944764, 43.313597]
        this.zoom = 15
        this.setSearch = null
      },
      setAdvParams () {
        if (this.adv) {
          this.advCreate.object_types = this.adv.object_type?.id
          this.advCreate.deal_types = this.adv.deal_type?.id
          this.advCreate.tariff_types = this.adv.tariff_type?.id
          this.advCreate.parking_space_sizes = this.adv.parking_space_size?.id
          this.advCreate.parking_space_numbers = this.adv.parking_space_number?.id
          this.advCreate.characteristics = this.adv.characteristics?.map((el: any) => el.id)
          this.advCreate.description = this.adv.description
          this.advCreate.city_name = this.adv.city?.name
          this.advCreate.city_id = this.adv.city?.id
          this.advCreate.price = Number(this.adv.price)?.toFixed(0)
          this.advCreate.area = Number(this.adv.area)?.toFixed(0)
          this.advCreate.name = this.adv.name
          this.center = [this.adv.longitude, this.adv.latitude]
          this.advCreate.latitude = this.adv.latitude
          this.advCreate.longitude = this.adv.longitude
          this.advCreate.parking_types = this.adv.parking_type_id || 1

          this.zoom = 17
          this.setSearch =  {
            "geometry": {
              "type": "Point",
              "coordinates": [
                this.adv.longitude,
                this.adv.latitude
              ]
            },
            "properties": {
              "name": this.adv.name,
              "description": this.adv.city?.name
            }
          } 
          this.advCreate.savedImages = this.adv.media?.map((el: any) => el.media_url)
        }
        
      },
      async fetchDictionaries() {
        try {
          this.loading = true
          const {$api} = useApi()
          const data = await $api(`/advertisements/dictionaries`);
          if (data) {
            if (data.parking_space_sizes && data.parking_space_sizes[0]) {
              data.parking_space_sizes[0].top = '-2px';
              data.parking_space_sizes[0].left = '11px';
              data.parking_space_sizes[0].height = '69px';
              data.parking_space_sizes[0].width = '93.88px';
            }
            if (data.parking_space_sizes && data.parking_space_sizes[1]) {
              data.parking_space_sizes[1].top = '-10px';
              data.parking_space_sizes[1].left = '0px';
              data.parking_space_sizes[1].height = '93px';
              data.parking_space_sizes[1].width = '103.14px';
            }
            if (data.parking_space_sizes && data.parking_space_sizes[2]) {
              data.parking_space_sizes[2].top = '8px';
              data.parking_space_sizes[2].left = '40px';
              data.parking_space_sizes[2].height = '51.88px';
              data.parking_space_sizes[2].width = '51.34px';
            }
            
            this.dictionaries = data;

            this.resetAdvParams();
          }
          this.loading = false
        } catch (error) {
          console.error('Error fetching dictionaries:', error);
          this.loading = false
        }
      },
      async fetchMyAdvBySlug(slug: string) {
        try {
          this.loading = true
          const {$api} = useApi()
          const {data} = await $api(`/advertisements/my/${slug}`);
          this.adv = {...data, my: true}
          this.loading = false
          return data
        } catch (error) {
          console.error('Error fetching dictionaries:', error);
          this.loading = false
        }
      },
      async fetchAdvBySlug(slug: string) {
        try {
          this.loading = true
          const {$api} = useApi()
          const {data} = await $api(`/advertisements/advertisement/${slug}`);
          this.adv = data
          this.loading = false
          return data
        } catch (error) {
          console.error('Error fetching dictionaries:', error);
          this.loading = false
        }
      },
      async fetchSearchAdv() {
        this.loading = true
        try {
          const main_store = useMainStore()
          const { $api } = useApi()
          
          const query = {
            size: main_store.filters.from_size,
            city_id: main_store.city,
            deal_type_id: main_store.filters.deal_types,
            object_type_id: main_store.filters.object_types?.length === 2 ? null : main_store.filters.object_types?.length === 1 ? main_store.filters.object_types[0] : null,
            parking_space_size_id: main_store.filters.parking_space_sizes,
            price: main_store.filters.from_price,
            query: main_store.search,
            tariff_type_id: main_store.filters.deal_types == 1 ? main_store.filters.tariff_types : null,
            latitude: main_store.search ? main_store?.center[1] : null,
            longitude: main_store.search ? main_store?.center[0] : null,
            distance: main_store.search ? (main_store?.distance || 2) : 100,
            max_area: main_store.filters.to_size,
            max_price: main_store.filters.to_price,
            min_area: main_store.filters.from_size,
            min_price: main_store.filters.from_price,
            parking_type_id: main_store?.filters.parking_types !== 1 ? main_store?.filters.parking_types : null,
            characteristics: main_store?.filters.characteristics.length ? main_store?.filters.characteristics : null,
            parking_space_numbers: main_store?.filters.parking_space_numbers,

          }
          Object.keys(query).forEach((k) => !query[k] && delete query[k]);
          let sp = new URLSearchParams(query).toString();

          const { data } = await $api(`/advertisements/search?${sp}`)

          this.advSearch = data
          this.loading = false
        } catch (error) {
            console.log(error);
            this.loading = false
        }
      },
      async addAdvertisements(body: any) {
        try {
          const {$api} = useApi()
          const data = await $api(`/advertisements/my/submit`, 'POST', body);
          return data
        } catch (error) {
          console.error('Error adding advertisements:', error);
        }
      },
      async editAdvertisements(slug: string, body: any) {
        try {
          const {$api} = useApi()
          const data = await $api(`/advertisements/my/${slug}/update`, 'POST', body);
          return data
        } catch (error) {
          console.error('Error edit advertisements:', error);
        }
      },
      async deleteAdvertisements(slug: string) {
        try {
          const {$api} = useApi()
          const data = await $api(`/advertisements/my/${slug}`, 'DELETE');
          return data
        } catch (error) {
          console.error('Error delete advertisements:', error);
        }
      },
      async archiveAdvertisements(slug: string) {
        try {
          const {$api} = useApi()
          const data = await $api(`/advertisements/my/${slug}/archive`, 'POST');
          return data
        } catch (error) {
          console.error('Error archive advertisements:', error);
        }
      },
      async unArchiveAdvertisements(slug: string) {
        try {
          const {$api} = useApi()
          const data = await $api(`/advertisements/my/${slug}/unarchive`, 'POST');
          return data
        } catch (error) {
          console.error('Error unarchive advertisements:', error);
        }
      },
    },
  })