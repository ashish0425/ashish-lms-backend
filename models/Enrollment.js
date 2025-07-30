const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
  quizAttempts: [{
    quizId: { type: mongoose.Schema.Types.ObjectId },
    score: { type: Number },
    answers: [Number],
    attemptedAt: { type: Date, default: Date.now }
  }],
  progressPercentage: { type: Number, default: 0 },
  enrolledAt: { type: Date, default: Date.now },
  completedAt: Date
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);