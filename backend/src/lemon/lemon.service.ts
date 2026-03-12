import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LemonService {
    constructor() {}

    async createCheckout() {
        const res = await axios.post(
            'https://api.lemonsqueezy.com/v1/checkouts',
            {
                data: {
                    type: 'checkouts',
                    attributes: {
                        custom_price: 1999,
                        checkout_data: {
                            email: 'albertsoulking@gmail.com',
                            custom: {
                                title: '性感猫耳朵套装',
                                image: 'https://carevourvip.com/assets/adult-9a3f58b5.png',
                                priceText: '$19.99',
                                productName: 'ABC',
                                orderId: '1'
                            }
                        },
                    },
                    relationships: {
                        store: {
                            data: {
                                type: 'stores',
                                id: '190407'
                            }
                        },
                        variant: {
                            data: {
                                type: 'variants',
                                id: '849969'
                            }
                        }
                    }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
                    Accept: 'application/vnd.api+json',
                    'Content-Type': 'application/vnd.api+json'
                }
            }
        );

        return res.data;// { url: res.data.data.attributes.url };
    }
}
