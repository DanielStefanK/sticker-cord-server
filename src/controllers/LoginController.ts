import { Request, Response } from 'express';
import { Controller, Middleware, Get, Put, Post, Delete } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';

@Controller('login')
class LoginController {
    @Get()
    private login(req: Request, res: Response) {
        res.send("hi")
    }
}

export {LoginController}