import { Button } from "@mui/material";

const ButtonSubmit = ({ onSubmit }) => {
    return (
        <Button
            variant={'contained'}
            fullWidth
            onClick={onSubmit}>
            Submit
        </Button>
    );
};

export default ButtonSubmit;
