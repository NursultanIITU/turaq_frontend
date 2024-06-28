export interface IAdvertisement {
    slug: string,
    price: number,
    image: string,
    name: string,
    city: {
        id: string | number,
        name: string,
    },
    area: number,
    media: {
        id: string | number,
        media_url: string
    }
    characteristics?: {
        id: string | number,
        title: string,
    }[]
}