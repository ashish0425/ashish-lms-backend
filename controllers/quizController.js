const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const getQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    
    const course = await Course.findOne({ 'quizzes._id': quizId });
    if (!course) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = course.quizzes.id(quizId);
    
    // Return quiz without correct answers
    const quizData = {
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions.map(q => ({
        id: q._id,
        questionText: q.questionText,
        options: q.options,
        orderIndex: q.orderIndex
      }))
    };

    res.json(quizData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const submitQuizAttempt = async (req, res) => {
  try {
    const quizId = req.params.id;
    const userId = req.user._id;
    const { answers } = req.body;

    const course = await Course.findOne({ 'quizzes._id': quizId });
    if (!course) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = course.quizzes.id(quizId);
    const enrollment = await Enrollment.findOne({ 
      userId, 
      courseId: course._id 
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Not enrolled in this course' });
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / totalQuestions) * 100;

    // Save attempt
    const attempt = {
      quizId,
      score,
      answers,
      attemptedAt: new Date()
    };

    enrollment.quizAttempts.push(attempt);
    await enrollment.save();

    res.status(201).json({
      attemptId: attempt._id,
      score,
      totalQuestions,
      correctAnswers,
      attemptedAt: attempt.attemptedAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getQuizAttempts = async (req, res) => {
  try {
    const quizId = req.params.id;
    const userId = req.user._id;

    const course = await Course.findOne({ 'quizzes._id': quizId });
    const enrollment = await Enrollment.findOne({ 
      userId, 
      courseId: course._id 
    });

    const attempts = enrollment.quizAttempts.filter(
      attempt => attempt.quizId.toString() === quizId
    );

    res.json({
      attempts: attempts.map(attempt => ({
        id: attempt._id,
        score: attempt.score,
        totalQuestions: course.quizzes.id(quizId).questions.length,
        attemptedAt: attempt.attemptedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getQuiz, submitQuizAttempt, getQuizAttempts };