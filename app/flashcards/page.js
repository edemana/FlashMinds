"use client"

import React, { useEffect, useState } from 'react';
import { Container, AppBar, Toolbar, Typography, IconButton, InputBase, Button, Avatar, Card,Box, CardContent, CardMedia, CardActions } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, deleteDoc, collection } from "firebase/firestore";
import { db } from "@/utils/firebase"; // Import the Firestore instance
import axios from 'axios';

export default function Flashcards() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [flashcardSets, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const router = useRouter();
    const API_KEY = process.env.PEXELS_API_KEY; // Replace with your Pexels API key

    useEffect(() => {
        if (!isLoaded || !user) return;
        
        async function getFlashcards() {
            try {
                const docRef = doc(collection(db, 'users'), user.id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const collections = docSnap.data().flashcardSets || [];
                    setFlashcards(collections);
                } else {
                    // Initialize the document with an empty flashcards array if it doesn't exist
                    await setDoc(docRef, { flashcardSets: [] });
                    setFlashcards([]);
                }
            } catch (err) {
                setError("Failed to fetch flashcards.");
            } finally {
                setLoading(false);
            }
        }

        getFlashcards();
    }, [isLoaded, user]);

    useEffect(() => {
        async function fetchImages(query) {
            const url = `https://api.pexels.com/v1/search?query=${query}&per_page=1`;
            try {
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${API_KEY}` // Ensure to use the correct header
                    }
                });
                const photos = response.data.photos;
                if (photos.length > 0) {
                    return photos[0].src.medium; // You can choose the image size that fits your needs
                } else {
                    console.error('No images found');
                    return null;
                }
            } catch (error) {
                console.error('Error fetching images from Pexels:', error);
                return null;
            }
        }

        async function getImage() {
            for (const flashcard of flashcardSets) {
                const image = await fetchImages(flashcard.name); // Use the flashcard name or other relevant data as the query
                if (image) {
                    setImageUrl(image);
                    break; // Assuming you want the image for the first flashcard or you can handle this differently
                }
            }
        }

        if (flashcardSets.length > 0) {
            getImage();
        }
    }, [flashcardSets, API_KEY]);

    const handleCardClick = (id) => {
        router.push(`/flashcard?id=${id}`);
    };

    const handleDelete = async (name) => {
        if (!user) return;
        try {
            // Reference to the specific flashcard set document
            const docRef = doc(db, 'users', user.id, 'flashcardSets', name);
            
            // Delete the entire document
            await deleteDoc(docRef);
    
            // Update the local state (assuming you have a state variable for all flashcard sets)
            setFlashcards(prevSets => prevSets.filter(set => set.name !== name));
        } catch (err) {
            console.error("Error deleting flashcard set:", err);
            setError("Failed to delete flashcard set.");
        }
    };

    if (loading) {
        return <Container maxWidth="md"><Typography>Loading...</Typography></Container>;
    }

    if (error) {
        return <Container maxWidth="md"><Typography>{error}</Typography></Container>;
    }

    return (
        <div style={{ fontFamily: 'Inter, "Noto Sans", sans-serif', minHeight: '100vh', backgroundColor: '#E9EFFB' }}>
            <AppBar position="static" sx={{ borderBottom: '1px solid #f0f2f4', padding: '0 16px' }}>
                <Toolbar>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '10px'}}>
                        <Box sx={{ width: 32, height: 32 }}>
                           <img src="/logo.png" alt="FlashMinds Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </Box>
                        <Typography variant="h6" color="#111418" fontWeight='bold' >
                            FlashMinds
                        </Typography>
                    </div>
                    <div style={{ flexGrow: 1 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f3f2f4', borderRadius: '8px', padding: '0 8px' }}>
                            <SearchIcon sx={{ color: '#637588' }} />
                            <InputBase placeholder="Search" sx={{ ml: 1, flex: 1, color: '#113418' }} />
                        </div>
                        <IconButton color="inherit">
                            <NotificationsIcon sx={{ color: '#111418' }} />
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar>
            <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ maxWidth: '960px', width: '100%' }}>
                    <Typography variant="h4" color="#111418" fontWeight="bold" marginBottom="16px">
                        All flashcard sets
                    </Typography>
                    <Card sx={{ display: 'flex', alignItems: 'center', padding: '16px', border: '1px solid #dce0e5', borderRadius: '8px', marginBottom: '16px' }}>
                        <div style={{ flexGrow: 1 }}>
                            <Typography variant="h6" color="#111418" fontWeight="bold">
                                Create a new set
                            </Typography>
                            <Typography color="#637588">
                                Sets are groups of cards that you can study together. You can also create a set by importing a list of terms and definitions.
                            </Typography>
                        </div>
                        <Button variant="contained" color="primary" href='/generate'>
                            Create
                        </Button>
                    </Card>
                    {flashcardSets.map((flashcard, index) => (
                        <Card key={index} sx={{ display: 'flex', alignItems: 'center', padding: '16px', border: '1px solid #dce0e5', borderRadius: '8px', marginBottom: '16px' }}>
                            <CardMedia
                                sx={{ width: 80, height: 80, borderRadius: '8px' }}
                                image={imageUrl}
                            />
                            <CardContent>
                                <Typography variant="body1" color="#111418" fontWeight="bold">
                                    {flashcard.name}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="#637588">
                                    {flashcard.length} cards
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <IconButton onClick={() => handleCardClick(flashcard.name)}>
                                    <MoreVertIcon />
                                </IconButton>
                                <Button onClick={() => handleDelete(flashcard.name)}>
                                    delete
                                </Button>
                            </CardActions>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}