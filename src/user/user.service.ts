import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/User.schema';
import { UserSettings } from 'src/schemas/UserSettings.schema';
import { CreateUserDto } from './dto/CreateUser.dto';
import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/UpdateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserSettings.name)
    private userSettingsModel: Model<UserSettings>,
  ) {}

  async createUser({ settings, ...CreateUserDto }: CreateUserDto): Promise<User | undefined> {
    if (settings) {
      const newSettings = new this.userSettingsModel(settings);
      const savedNewSettings = await newSettings.save();
      const newUser = new this.userModel({
        ...CreateUserDto,
        settings: savedNewSettings._id,
      });

      return newUser.save();
    }

    const newUser = new this.userModel(CreateUserDto);
    return newUser.save();
  }

  async getUsers(): Promise<User[] | undefined> {
    return await this.userModel.find().populate(['settings', 'posts']);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return await this.userModel.findById(id).populate(['settings', 'posts']);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User | undefined> {
    return await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  async deleteUser(id: string): Promise<User | undefined> {
    return await this.userModel.findByIdAndDelete(id);
  }
}
