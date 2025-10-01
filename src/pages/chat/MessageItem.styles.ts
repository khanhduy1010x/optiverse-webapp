import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

export const StyledReactionButton = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: theme.palette.grey[100],
    margin: '0 4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: theme.palette.grey[200],
    },
}));

export const ReactionPicker = styled(Box)(({ theme }) => ({
    display: 'flex',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '24px',
    padding: '4px',
    boxShadow: theme.shadows[3],
    position: 'absolute',
    bottom: '100%',
    marginBottom: '8px',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-in-out',
    '@keyframes fadeIn': {
        '0%': {
            opacity: 0,
            transform: 'translateY(10px)',
        },
        '100%': {
            opacity: 1,
            transform: 'translateY(0)',
        },
    },
}));

export const ReactionEmoji = styled(Typography)(({ theme }) => ({
    fontSize: '20px',
    padding: '4px',
    cursor: 'pointer',
    borderRadius: '50%',
    '&:hover': {
        backgroundColor: theme.palette.grey[100],
    },
}));

export const MessageActionsContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '-28px',
    display: 'flex',
    opacity: 0,
    transition: 'opacity 0.2s ease',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '20px',
    boxShadow: theme.shadows[1],
    zIndex: 10,
}));

export const ReactionButtonsContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    marginTop: '4px',
    flexWrap: 'wrap',
    gap: '4px',
}));