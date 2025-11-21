import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        access_token: string;
    } | {
        message: string;
    }>;
    register(createUserDto: CreateUserDto): Promise<{
        email: string;
        password: string;
        name: string;
        role: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getProfile(req: any): any;
}
