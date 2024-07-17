import {z} from 'zod';

export const messageSchema=z.object({
    content:z.string().min(8,"Message should be at least 8 characters!").max(300,"Message can't be longer than 300 characters!")
})
