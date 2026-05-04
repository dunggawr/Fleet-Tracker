import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const { email, password, role } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      email,
      passwordHash,
      role,
    });

    const savedUser = await this.userRepository.save(user);
    delete savedUser.passwordHash;
    return savedUser;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
      select: ['id', 'email', 'passwordHash', 'role'],
    });

    if (user && user.passwordHash && (await bcrypt.compare(password, user.passwordHash))) {
      const payload = { sub: user.id, email: user.email, role: user.role };
      return {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async validateUser(payload: any): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: payload.sub, isActive: true },
    });
  }
}
