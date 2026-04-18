// ===========================================
// Room Model - MongoDB Schema
// ===========================================

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoom extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  building: string;
  floor: string;
  type: 'lecture' | 'lab' | 'seminar' | 'workshop';
  capacity: number;
  facilities: string[];
  department?: mongoose.Types.ObjectId;
  isAvailable: boolean;
  isActive: boolean;
  hasProjector: boolean;
  hasAC: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: [true, 'Please provide room name/number'],
      trim: true,
    },
    building: {
      type: String,
      required: [true, 'Please provide building name'],
      trim: true,
    },
    floor: {
      type: String,
      required: [true, 'Please provide floor'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['lecture', 'lab', 'seminar', 'workshop'],
      default: 'lecture',
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide room capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
    facilities: {
      type: [String],
      default: [],
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    hasProjector: {
      type: Boolean,
      default: false,
    },
    hasAC: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
RoomSchema.index({ building: 1, name: 1 });
RoomSchema.index({ type: 1 });
RoomSchema.index({ capacity: 1 });
RoomSchema.index({ department: 1 });

const Room: Model<IRoom> =
  mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);

export default Room;
