import { Hono } from 'hono'
import { Prisma, PrismaClient } from '@prisma/client/extension';
import { env } from 'hono/adapter';
import {decode , sign , verify} from "hono/jwt";

export const blogRouter = new Hono<{
    Bindings : {
        DATABASE_URL : string,
        JWT_SECRET : string
    },
    Variables:{
        userId : string
    }
}>()

blogRouter.use(async(c,next)=>
{
    c.set('userId' ,"jwt");
    await next()
});

blogRouter.post('/' , async(c)=> 
{
    const userId = c.get('userId');
    const prisma = new PrismaClient(
        {
            datasourceUrl : c.env.DATABASE_URL
        })

        const body = await c.req.json();
        const post = await prisma.post.create({
            data:{
                title : body.title,
                content : body.content,
                authorId : userId
            }
        });

        return c.json(
            {
                id : post.id
            });
});

blogRouter.put('/' , async(c)=>
{
    const userId = c.get('userId');
    const prisma = new PrismaClient(
        {
            datasourceUrl : c.env.DATABASE_URL
        }
    )
    const body = await c.req.json();
    prisma.post.update(
        {
            where: {
                id : body.id,
                authorId : userId
            },
            data : 
            {
                title : body.title,
                content : body.content
            }
});
return c.text("Updated Post !");
})

blogRouter.get('/:id' , async(c)=> 
{
    const id = c.req.param('id');
    const prisma = new PrismaClient(
        {
                datasourceUrl : c.env.DATABASE_URL
        })

        const post = await prisma.post.findUnique(
            {
                where : 
                    {
                        id
                    }
            });
    return c.json(post);
})