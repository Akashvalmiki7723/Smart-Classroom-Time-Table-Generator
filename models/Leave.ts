// ===========================================
// Leave Model - MongoDB Schema
// ===========================================

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeave extends Document {
  _id: mongoose.Types.ObjectId;
  faculty: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  leaveType: 'casual' | 'sick' | 'earned' | 'duty' | 'other';
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: mongoose.Types.ObjectId;
  approvalDate?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema = new Schema<ILeave>(
  {
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide faculty reference'],
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Please provide department reference'],
    },
    leaveType: {
      type: String,
      enum: ['casual', 'sick', 'earned', 'duty', 'other'],
      required: [true, 'Please provide leave type'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason'],
      maxlength: [500, 'Reason cannot be more than 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvalDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      maxlength: [500, 'Rejection reason cannot be more than 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
LeaveSchema.index({ faculty: 1, startDate: -1 });
LeaveSchema.index({ department: 1, status: 1 });
LeaveSchema.index({ status: 1 });

const Leave: Model<ILeave> =
  mongoose.models.Leave || mongoose.model<ILeave>('Leave', LeaveSchema);

export default Leave;
