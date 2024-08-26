'use client';

import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Grid, Paper, Container, CircularProgress } from '@mui/material';
import { doc, collection, getDoc, writeBatch } from 'firebase/firestore';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { useAuth } from '@clerk/nextjs';
import { db } from '@/utils/firebase';
import Link from 'next/link';

export default function Generate() {
  const [text, setText] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [setName, setSetName] = useState('');
  const { getToken, userId, isLoaded } = useAuth();
  const [authReady, setAuthReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const signIntoFirebaseWithClerk = async () => {
      try {
        const token = await getToken({ template: 'integration_firebase' });
        if (!token) throw new Error('No token found');
        await signInWithCustomToken(auth, token);
        setAuthReady(true);
      } catch (error) {
        console.error('Error signing in to Firebase:', error);
        setAuthReady(false);
      }
    };

    if (isLoaded && userId) {
      signIntoFirebaseWithClerk();
    }
  }, [isLoaded, userId, getToken, auth]);

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('Please enter some text to generate flashcards.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ text }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to generate flashcards');

      const data = await response.json();
      setFlashcards(data);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('An error occurred while generating flashcards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveFlashcards = async () => {
    if (!authReady) {
      alert('Authentication is not yet ready. Please wait a moment and try again.');
      return;
    }
    if (!setName.trim()) {
      alert('Please enter a name for your flashcard set.');
      return;
    }
    if (!userId) {
      alert('You need to be signed in to save flashcards.');
      return;
    }

    setIsSaving(true);
    try {
      const userDocRef = doc(collection(db, 'users'), userId);
      const userDocSnap = await getDoc(userDocRef);
      const batch = writeBatch(db);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const updatedSets = [...(userData.flashcardSets || []), { name: setName }];
        batch.update(userDocRef, { flashcardSets: updatedSets });
      } else {
        batch.set(userDocRef, { flashcardSets: [{ name: setName }] });
      }

      const setDocRef = doc(collection(userDocRef, 'flashcardSets'), setName);
      batch.set(setDocRef, { flashcards });

      await batch.commit();
      alert('Flashcards saved successfully!');
      setSetName('');
    } catch (error) {
      console.error('Error saving flashcards:', error);
      alert('An error occurred while saving flashcards. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, "Noto Sans", sans-serif', minHeight: '100vh', backgroundColor: '#E9EFFB' }}>
      <Container maxWidth="md">
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ paddingY: 4, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 32, height: 32 }}>
                <img src="/logo.png" alt="FlashMinds Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </Box>
              <Typography variant="h5" component="h1" fontWeight="bold">
                FlashMinds
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Link href="/" passHref legacyBehavior>
                <Button component="a" variant="text">Home</Button>
              </Link>
              <Link href="/flashcards" passHref legacyBehavior>
                <Button component="a" variant="text">Flashcards</Button>
              </Link>
            </Box>
          </Box>
          
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', paddingY: 5 }}>
            <Box component="form" sx={{ maxWidth: 512, width: '100%' }}>
              <TextField
                label="Enter text"
                multiline
                minRows={6}
                fullWidth
                variant="outlined"
                value={text}
                onChange={(e) => setText(e.target.value)}
                sx={{ marginBottom: 3 }}
              />
              <Box sx={{ position: 'relative' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  onClick={handleSubmit}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Flashcards'}
                </Button>
                {isGenerating && (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>

          {flashcards.length > 0 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ paddingBottom: 2 }}>
                Generated Flashcards
              </Typography>
              <Grid container spacing={2}>
                {flashcards.map((flashcard, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper sx={{ padding: 2, height: '100%' }}>
                      <Typography variant="body2" color="textSecondary">Front</Typography>
                      <Typography variant="body1" sx={{ marginBottom: 1 }}>{flashcard.front}</Typography>
                      <Typography variant="body2" color="textSecondary">Back</Typography>
                      <Typography variant="body1">{flashcard.back}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ marginTop: 4 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ paddingBottom: 2 }}>
                  Save flashcards to a set
                </Typography>
                <TextField
                  label="Set Name"
                  fullWidth
                  variant="outlined"
                  value={setName}
                  onChange={(e) => setSetName(e.target.value)}
                  sx={{ marginBottom: 3 }}
                />
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={saveFlashcards}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  {isSaving && (
                    <CircularProgress
                      size={24}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px',
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </div>
  );
}