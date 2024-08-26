'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Grid } from '@mui/material';
import { Container, Card, CardMedia, CardContent } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { SignedOut, SignedIn, UserButton } from '@clerk/nextjs';
import getStripe from '@/utils/get-stripe';

const handleSubmit = async () => {
  try {
    const checkoutSession = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'origin': 'http://localhost:3000'
      },
    });

    if (!checkoutSession.ok) {
      throw new Error('Failed to create checkout session');
    }

    const checkoutSessionJson = await checkoutSession.json();
    const stripe = await getStripe();

    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    });

    if (error) {
      console.warn(error.message);
    }
  } catch (error) {
    console.error('Error during checkout:', error);
  }
};

const handleLearnMoreClick = () => {
  const pricingSection = document.getElementById('pricing');
  if (pricingSection) {
    pricingSection.scrollIntoView({ behavior: 'smooth' });
  }
};

const FlashMinds = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#E9EFFB',
        fontFamily: 'Manrope, "Noto Sans", sans-serif',
      }}
    >
      <Box
        sx={{
          borderBottom: '1px solid #f0f3f4',
          px: 5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
  <Box sx={{ width: 32, height: 32 }}>
    <img src="/logo.png" alt="FlashMinds Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
  </Box>
  <Typography variant="h6" sx={{ color: '#111517', fontWeight: 'bold' }}>
    FlashMinds
  </Typography>
</Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <SignedOut>
            <Button variant="contained" sx={{ bgcolor: '#1c84ca', color: 'white', borderRadius: 3 }} href="/sign-in">
              Login
            </Button>
            <Button variant="contained" sx={{ bgcolor: '#f0f3f4', color: '#111517', borderRadius: 3 }} href="/sign-up">
              Sign Up
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
            
          </SignedIn>
        </Box>
      </Box>
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <Box sx={{ maxWidth: 960, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Card
            sx={{
              width: '100%',
              aspectRatio: '16/9',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundImage: 'url("https://cdn.usegalileo.ai/stability/a4658c7a-37ec-4ca2-bf39-81266282c269.png")',
              borderRadius: 2,
            }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
            <Typography variant="h3" sx={{ color: '#111517', fontWeight: 'black' }}>
              Welcome to FlashMinds
            </Typography>
            <Typography variant="body1" sx={{ color: '#111517' }}>
              Get started with the most advanced flashcard app for professionals. Perfect for learning new languages, studying for exams, and memorizing important information.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" sx={{ bgcolor: '#1c84ca', color: 'white', borderRadius: 2 }} href="/generate">
                Get Started
              </Button>
              <Button variant="contained" sx={{ bgcolor: '#f0f3f4', color: '#111517', borderRadius: 2 }} onClick={handleLearnMoreClick}>
                Learn More
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>

      <Container sx={{ py: 5 }}>
        <Typography variant="h4" sx={{ color: '#111517', fontWeight: 'black', maxWidth: 720 }}>
          Features
        </Typography>
        <Grid container spacing={2} sx={{ mt: 3 }}>
          {[
            {
              title: 'AI-powered flashcards',
              description: 'Create flashcards in seconds with our AI-powered text recognition.',
              img: 'https://cdn.usegalileo.ai/sdxl10/2ea28b60-ff77-449e-a770-f967af67791c.png',
            },
            {
              title: 'Rich media support',
              description: 'Add images, audio, video, and more to your flashcards.',
              img: 'https://cdn.usegalileo.ai/sdxl10/ec9e6984-6ecf-421c-9031-5fdd2a6b2da1.png',
            },
            {
              title: 'Customizable card types',
              description: 'Choose from a variety of card types, including multiple choice, fill-in-the-blank, and more.',
              img: 'https://cdn.usegalileo.ai/sdxl10/93fb3483-2d80-4222-bdb8-270780adf93f.png',
            },
            {
              title: 'Advanced scheduling',
              description: 'Use our advanced algorithm to optimize your study sessions for maximum retention.',
              img: 'https://cdn.usegalileo.ai/sdxl10/12e59c9c-176b-43ad-8fac-a403462a3d09.png',
            },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ borderRadius: 2 }}>
                <CardMedia
                  sx={{
                    height: 0,
                    paddingTop: '56.25%', // 16:9 aspect ratio
                  }}
                  image={feature.img}
                  title={feature.title}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#111517' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#647987' }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container id="pricing" sx={{ py: 3 }}>
        <Grid container spacing={2}>
          {[
            {
              title: 'Free',
              price: '$0',
              features: ['200 cards/month', 'Basic scheduling', 'Text-only cards', 'Community content'],
            },
            {
              title: 'Basic',
              price: '$2',
              features: ['1000 cards/month', 'Advanced scheduling', 'Media support', 'Exclusive content'],
            },
            {
              title: 'Pro',
              price: '$5',
              features: ['3000 cards/month', 'Advanced scheduling', 'Media support', 'Premium content'],
            },
            // Add more pricing plans here...
          ].map((plan, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ borderRadius: 2, border: '1px solid #dce1e5', p: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#111517' }}>
                    {plan.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="h3" sx={{ color: '#111517', fontWeight: 'black' }}>
                      {plan.price}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#111517', fontWeight: 'bold' }}>
                      /month
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    {plan.features.map((feature, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CheckCircle sx={{ color: '#1c84ca', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: '#111517' }}>
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button variant="contained" sx={{ bgcolor: '#1c84ca', color: 'white', borderRadius: 2 }} onClick={handleSubmit}>
                    Choose Plan
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: '#647987' }}>
          &copy; 2024 FlashMinds. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default FlashMinds;
