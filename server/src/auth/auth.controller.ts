import { Body, Controller, Get, Post, Put, Query } from "@nestjs/common";
import { User } from "../database/models";

@Controller("api/auth/me")
export class MeController {
  @Get()
  async getMe(@Query("userId") userId?: string) {
    try {
      let user: any = null;

      if (userId) {
        user = await User.findOne({ id: Number(userId) }).lean();
      }
      if (!user) {
        user = await User.findOne({}).lean();
      }

      const availableUsers = await User.find({}).lean();
      return {
        success: true,
        user: user ? sanitize(user) : null,
        availableUsers: availableUsers.map(sanitize),
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  @Put()
  async updateMe(@Body() body: Record<string, any>) {
    try {
      const { id, name, phone, email, insuranceType, nationalId, city, neighborhood, address, allergies } = body || {};
      if (!id) return { success: false, error: "شناسه کاربر الزامی است" };

      const updated = await User.findOneAndUpdate(
        { id: Number(id) },
        { name, phone, email, insuranceType, nationalId, city, neighborhood, address, allergies },
        { new: true },
      ).lean();
      return { success: true, user: updated ? sanitize(updated) : null };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}

@Controller("api/auth/switch")
export class AuthSwitchController {
  @Post()
  async switch(@Body() body: Record<string, any>) {
    try {
      const { userId, role, phone } = body || {};
      let user: any = null;

      if (userId) user = await User.findOne({ id: Number(userId) }).lean();
      else if (role) user = await User.findOne({ role }).lean();
      else if (phone) user = await User.findOne({ phone }).lean();

      if (!user) return { success: false, error: "کاربر مورد نظر یافت نشد" };
      return { success: true, user: sanitize(user) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}

function sanitize(u: any) {
  const { _id, __v, ...rest } = u || {};
  return rest;
}
