// routes/payments.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const { ensureAuthenticated } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Course = require('../models/Course');
const User = require('../models/User');

// Configuração do Multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/payments/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas PDF ou imagens são permitidos'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Enviar comprovante de pagamento
router.post('/:courseId', ensureAuthenticated, upload.single('proof'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    const payment = new Payment({
      student: req.user._id,
      course: req.params.courseId,
      amount: course.discountPrice || course.price,
      paymentMethod: req.body.paymentMethod,
      proof: '/uploads/payments/' + req.file.filename
    });

    await payment.save();

    // Notificar admin
    await Notification.createAndSend(
      null, // Enviar para todos os admins
      'Novo Comprovante de Pagamento',
      `O aluno ${req.user.fullName} enviou um comprovante para o curso ${course.title}`,
      'payment',
      payment._id,
      req.io,
      { isAdminNotification: true }
    );

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});







// Rota para criar sessão de checkout
router.post('/create-checkout-session', async (req, res) => {
  const { courseId } = req.body;
  
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: course.title,
            description: course.description,
          },
          unit_amount: course.discountPrice ? course.discountPrice * 100 : course.price * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.DOMAIN}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN}/courses/${courseId}`,
      metadata: {
        courseId: courseId.toString(),
        userId: req.user.id.toString()
      }
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar sessão de pagamento' });
  }
});

// Webhook para eventos do Stripe
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Fulfill the purchase
    await fulfillOrder(session);
  }

  res.json({ received: true });
});

async function fulfillOrder(session) {
  const courseId = session.metadata.courseId;
  const userId = session.metadata.userId;

  await User.findByIdAndUpdate(userId, {
    $addToSet: { coursesEnrolled: courseId }
  });

  // Aqui você pode adicionar lógica para enviar email de confirmação
}

module.exports = router;