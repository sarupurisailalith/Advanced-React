import 'dotenv/config';
import { config, createSchema} from '@keystone-next/keystone/schema';
import {createAuth} from '@keystone-next/auth';
import { withItemData, statelessSessions } from '@keystone-next/keystone/session';
import { User } from './schemas/User';
import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';
import {CartItem} from './schemas/CartItem';
import { insertSeedData } from './seed-data';
import { sendPasswordResetEmail } from './lib/mail';
import {extendGraphqlSchema} from './mutations/index';

const databaseURL = process.env.DATABASE_URL || 'mongodb://localhost/keystone-sick-fits-tutorial';

const sessionConfig = {
    maxAge: 60 * 60 * 24 * 360, // how long should they stay signed in 
    secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
    listKey: 'User',
    identityField: 'email',
    secretField: 'password',
    initFirstItem: {
        fields: ['name', 'email', 'password'],
        //TODO: add in initial roles here 
    }, 
    passwordResetLink: {
        async sendToken(args) {
            // send the email 
            await sendPasswordResetEmail(args.token, args.identity);
        },
    },
});

export default withAuth(config({
    server: {
        cors: {
            origin: [process.env.FRONTEND_URL],
            credentials: true,
        }
    },
    db: {
        adapter: 'mongoose',
        url: databaseURL,
        async onConnect(keystone) {
            if(process.argv.includes('--seed-data')){
                await insertSeedData(keystone);
            }
        },
    },
    lists: createSchema({
        //Schema items go here
        User,
        Product,
        ProductImage,
        CartItem,
    }),
    extendGraphqlSchema,
    ui: {
        // show ui only for people who pass this test 
        isAccessAllowed: ({ session }) => {
            return session?.data
        },
    },
    session: withItemData(statelessSessions(sessionConfig), {
        User: 'id name email',
    })
}));