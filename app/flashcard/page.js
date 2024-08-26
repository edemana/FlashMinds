'use client'
import { useUser } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { Container, Typography, Card, CardContent, Button, Box, AppBar,Toolbar } from "@mui/material"
import { db } from "@/utils/firebase"

export default function FlashcardSet() {
    const { isLoaded, user } = useUser()
    const [flashcards, setFlashcards] = useState(null)
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [showAnswer, setShowAnswer] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const searchParams = useSearchParams()
    const setId = searchParams.get('id')

    useEffect(() => {
        if (!isLoaded || !user || !setId) return
        async function getFlashcards() {
            try {
                const docRef = doc(db, 'users', user.id, 'flashcardSets', setId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const flashcardsData = docSnap.data().flashcards || [];
                    if (flashcardsData.length > 0) {
                        setFlashcards(flashcardsData);
                    } else {
                        setError("Flashcard set is empty.");
                    }
                } else {
                    setError("Flashcard set not found.");
                }
            } catch (err) {
                console.error("Error fetching flashcards:", err);
                setError("Failed to fetch flashcards.");
            } finally {
                setLoading(false);
            }
        }
        getFlashcards()
    }, [isLoaded, user, setId])

    const handleNextCard = () => {
        if (flashcards && flashcards.length > 0) {
            setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length)
            setShowAnswer(false)
        }
    }

    const handlePrevCard = () => {
        if (flashcards && flashcards.length > 0) {
            setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length)
            setShowAnswer(false)
        }
    }

    const toggleAnswer = () => {
        setShowAnswer(!showAnswer)
    }

    if (loading) {
        return <Container maxWidth="md"><Typography>Loading...</Typography></Container>
    }

    if (error) {
        return <Container maxWidth="md"><Typography>{error}</Typography></Container>
    }

    if (!flashcards || flashcards.length === 0) {
        return <Container maxWidth="md"><Typography>No flashcards available in this set.</Typography></Container>
    }

    const currentCard = flashcards[currentCardIndex]

    return (
        <div style={{ fontFamily: 'Inter, "Noto Sans", sans-serif', height: '100vh', backgroundColor: '#E9EFFB', display: 'flex', flexDirection: 'column' }}>
    <AppBar position="static" sx={{ marginBottom: 4 }}>
        <Toolbar>
            <Typography variant="h4" sx={{ flex: 1, textAlign: 'center' }}>
                Flashcard Set: {setId}
            </Typography>
        </Toolbar>
    </AppBar>
    <Container maxWidth="md" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Card sx={{ minHeight: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 2 }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    {showAnswer ? currentCard.back : currentCard.front}
                </Typography>
            </CardContent>
        </Card>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handlePrevCard} variant="contained">Previous</Button>
            <Button onClick={toggleAnswer} variant="contained" color="secondary">
                {showAnswer ? "Show Front" : "Show Back"}
            </Button>
            <Button onClick={handleNextCard} variant="contained">Next</Button>
        </Box>
        <Typography sx={{ mt: 2 }}>
            Card {currentCardIndex + 1} of {flashcards.length}
        </Typography>
    </Container>
</div>
    )
}