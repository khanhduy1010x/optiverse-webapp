import React from 'react';
import { useParams } from 'react-router-dom';
import { Flashcard, FlashcardDeckCard } from '../../components/common/Card';

export default function FlashcardsScreen() {
  const { deckId } = useParams();

  return (
    <div className="w-full max-w-2xl mx-auto p-4 pb-8 flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-6">Deck ID: {deckId} </h1>

      {/* Deck Header */}
      <FlashcardDeckCard
        title="400 English Words"
        lastReview={2000}
        learningFlashcard={3}
        newFlashcard={4}
        reviewingFlashcard={12}
      ></FlashcardDeckCard>

      {/* Cards section */}
      <div className="flex-col flex gap-8">
        <h3 className="text-lg">cards</h3>

        <Flashcard
          front={`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut neque
            diam, malesuada nec leo eget, facilisis suscipit velit. Cras mattis,
            orci id laoreet fermentum, erat massa finibus orci, eget volutpat
            neque nibh sit amet ante.`}
          back={`Aenean quis sodales velit. Etiam dolor nisi, dictum nec vulputate
            nec, semper nec lectus. Maecenas et neque id nisi eleifend gravida.
            Aenean quis elit sed sapien convallis tempus. In hac habitasse
            platea dictumst.`}
        ></Flashcard>

        <Flashcard
          front={`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut neque
            diam, malesuada nec leo eget, facilisis suscipit velit. Cras mattis,
            orci id laoreet fermentum, erat massa finibus orci, eget volutpat
            neque nibh sit amet ante.`}
          back={`Aenean quis sodales velit. Etiam dolor nisi, dictum nec vulputate
            nec, semper nec lectus. Maecenas et neque id nisi eleifend gravida.
            Aenean quis elit sed sapien convallis tempus. In hac habitasse
            platea dictumst.`}
        ></Flashcard>
      </div>

      {/* Bottom border/shadow */}
      <div className="fixed bottom-0 left-0 right-0 h-2 bg-gray-300"></div>
    </div>
  );
}
