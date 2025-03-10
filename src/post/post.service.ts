import { HttpException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from 'src/schemas/Post.schema';
import { Model } from 'mongoose';
import { User } from 'src/schemas/User.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create({ userId, ...createPostDto }: CreatePostDto) {
    const user = this.userModel.findById(userId);
    if (!user) throw new HttpException('User Not Found', 404);
    const createdPost = new this.postModel({ ...createPostDto, user: userId });
    const savedPost = await createdPost.save();
    await user.updateOne({
      $push: {
        posts: savedPost._id,
      },
    });
    return savedPost;
  }

  findAll() {
    return this.postModel.find().exec();
  }

  findOne(id: number) {
    const post = this.postModel.findById(id).exec();
    if (!post) throw new HttpException('Post Not Found', 404);
    return post;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  async remove(id: number) {
    const post = await this.postModel.findById(id).exec();
    if (!post) throw new HttpException('Post Not Found', 404);

    return this.postModel.deleteOne({ _id: id }).then(() => post);
  }
}
