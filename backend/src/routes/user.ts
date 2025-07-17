import { Hono } from 'hono'
import { Prisma, PrismaClient } from '@prisma/client/extension';
import { env } from 'hono/adapter';
import {decode , sign , verify} from "hono/jwt";

export const userRouter = new Hono<{
    Bindings : {
        DATABASE_URL : string,
        JWT_SECRET : string
    }
}>()


userRouter.post('/api/v1/signup' , async(c)=>
{
    const prisma = new PrismaClient({
        datasourceUrl :c.env.DATABASE_URL,
    })

    const body = await c.req.json();
   const user =  await prisma.user.create({
            data : {
                email : body.email,
                password : body.password,
            },
        })

        const token = await sign({id : user.id}, c.env.JWT_SECRET)
});

userRouter.post('/api/v1/signin' , async (c)=>
{
    const prisma = new PrismaClient(
        {
            datasourceUrl : c.env.DATABASE_URL
        }
    )
    const body = await c.req.json();
    const user = await prisma.user.findUnique(
        {
            where : {
                email : body.email,
                password : body.password
            }
        }
    );

    if(!user)   { c.status(403);  return c.json( {error : "User Not Found"})};
    const jwt = await sign({id : user.id} , c.env.JWT_SECRET);
    return c.json({jwt});
});

