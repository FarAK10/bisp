import { Role } from '@common/constants/roles.enum';
import * as bcrypt from 'bcrypt';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from '../dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name, role } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Email is already in use.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      roles: [role], // Default to 'Student' if no role is provided
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found.`);
    }
    return user;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found.`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.userRepository.update(id, { ...updateUserDto });

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
  }
}
