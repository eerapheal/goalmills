import mongoose from 'mongoose';

const StandupSchema = new mongoose.Schema(
  {
    meetingDate: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      default: '5:00 PM – 5:30 PM WAT',
    },
    platform: {
      type: String,
      default: 'Google Meet',
    },
    meetUrl: {
      type: String,
      default: 'https://meet.google.com/goalmills-newsroom',
    },
    hostName: {
      type: String,
      default: 'Ekpenisi Erue Raphael',
    },
    attendees: [
      {
        employeeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Employee',
          required: true,
        },
        employeeName: { type: String, required: true },
        status: {
          type: String,
          enum: ['present', 'late', 'absent', 'excused'],
          default: 'present',
        },
        talkingPoints: { type: String },
      },
    ],
    agenda: [{ type: String }],
    editorialPriorities: [{ type: String }],
    nextDayAssignments: [
      {
        employeeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Employee',
        },
        employeeName: { type: String, required: true },
        assignment: { type: String, required: true },
      },
    ],
    meetingNotes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Standup || mongoose.model('Standup', StandupSchema);
