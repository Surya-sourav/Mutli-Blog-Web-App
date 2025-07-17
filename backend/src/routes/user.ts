import { Hono } from 'hono'
import { Prisma, PrismaClient } from '@prisma/client/extension';
import { env } from 'hono/adapter';
import {decode , sign , verify} from "hono/jwt";
import { signinInput, signupInput } from '@suryeah/common-app';

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
    const {success} = signupInput.safeParse(body);
    if(!success) 
    {
        c.status(400);
        return c.json({error : "Invalid input"});
    }
    try {
   const user =  await prisma.user.create({
            data : {
                email : body.email,
                password : body.password,
            },
        })

        const jwt = await sign({id : user.id}, c.env.JWT_SECRET);
        return c.json({jwt});
    }
    catch(e)
    {
        c.status(403);
        return c.json({error : "error while signing up"});
    }
});


userRouter.post('/api/v1/signin' , async (c)=>
{
    const prisma = new PrismaClient(
        {
            datasourceUrl : c.env.DATABASE_URL
        }
    )
    const body = await c.req.json();
    const {success} = signinInput.safeParse(body);
    if(!success)
    {
        c.status(400);
        return c.json("Invalid Input")
    }
    
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

