const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const markLessonComplete = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user._id;

    // Find the course containing this lesson
    const course = await Course.findOne({ 'lessons._id': lessonId });
    if (!course) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const enrollment = await Enrollment.findOne({ 
      userId, 
      courseId: course._id 
    });
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Not enrolled in this course' });
    }

    // Add lesson to completed lessons if not already completed
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
      
      // Calculate progress percentage
      const totalLessons = course.lessons.length;
      const completedCount = enrollment.completedLessons.length;
      enrollment.progressPercentage = (completedCount / totalLessons) * 100;
      
      await enrollment.save();
    }

    res.json({
      message: 'Lesson marked as completed',
      progressUpdate: {
        lessonId,
        completedAt: new Date(),
        courseProgressPercentage: enrollment.progressPercentage
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const enrollments = await Enrollment.find({ userId })
      .populate('courseId', 'title lessons quizzes');

    const progressData = enrollments.map(enrollment => {
      const course = enrollment.courseId;
      const bestQuizScore = enrollment.quizAttempts.length > 0 
        ? Math.max(...enrollment.quizAttempts.map(attempt => attempt.score))
        : 0;

      return {
        courseId: course._id,
        courseTitle: course.title,
        progressPercentage: enrollment.progressPercentage,
        completedLessons: enrollment.completedLessons.length,
        totalLessons: course.lessons.length,
        quizAttempts: enrollment.quizAttempts.length,
        bestQuizScore,
        enrolledAt: enrollment.enrolledAt
      };
    });

    res.json({ enrolledCourses: progressData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCourseProgress = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    const enrollment = await Enrollment.findOne({ userId, courseId });

    if (!enrollment) {
      return res.status(404).json({ error: 'Not enrolled in this course' });
    }

    const lessonsProgress = course.lessons.map(lesson => ({
      lessonId: lesson._id,
      title: lesson.title,
      completed: enrollment.completedLessons.includes(lesson._id),
      completedAt: enrollment.completedLessons.includes(lesson._id) ? 
        enrollment.enrolledAt : null
    }));

    const quizResults = course.quizzes.map(quiz => {
      const attempts = enrollment.quizAttempts.filter(
        attempt => attempt.quizId.toString() === quiz._id.toString()
      );
      
      return {
        quizId: quiz._id,
        title: quiz.title,
        attempts: attempts.length,
        bestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0,
        lastAttemptAt: attempts.length > 0 ? 
          attempts[attempts.length - 1].attemptedAt : null
      };
    });

    res.json({
      courseId,
      progressPercentage: enrollment.progressPercentage,
      lessonsProgress,
      quizResults
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { markLessonComplete, getUserProgress, getCourseProgress };