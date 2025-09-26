import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  // Simple hardcoded user for demo purposes
  private readonly users = [
    {
      id: 1,
      username: 'admin',
      password: 'password123', // In production, use hashed passwords
      roles: ['admin'],
    },
  ];

  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = this.users.find(
      (u) => u.username === username && u.password === password,
    );
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.id, roles: user.roles };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        roles: user.roles,
      },
    };
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }
}