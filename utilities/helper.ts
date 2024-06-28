export const advPriceTariffType = (tariff_type_id: number): string => {
   let price_types = ''
   switch (tariff_type_id) {
    case 1:
        price_types = 'month'
        break;
    case 2:
        price_types = 'day'
        break;
    case 3:
        price_types = 'hour'
        break;
   
    default:
        break;
   }
   return price_types
};

export const statusChip = (status: string): Record<string, string> | undefined  => {
    switch (status) {
        case 'published':
            return { color: 'success', icon: '/cabinet/check.svg', text: 'published', }
        case 'rejected':
            return { color: 'red', icon: '/cabinet/error.svg', text: 'rejected', }
        case 'archive':
            return { color: 'chip-card', icon: '/cabinet/archive.svg', text: 'archive', variant: 'elevated' }
        case 'on_moderation':
            return { color: 'loading', icon: '/cabinet/loading.svg', text: 'on_moderation', variant: 'elevated' }
    }
}