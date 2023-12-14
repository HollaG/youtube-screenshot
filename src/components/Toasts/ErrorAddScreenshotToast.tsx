import * as React from "react";
import * as Toast from "@radix-ui/react-toast";
import "./Toast.css";

const ErrorAddScreenshotToast = ({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const timerRef = React.useRef(0);

    React.useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);

    return (
        <Toast.Provider swipeDirection="right">
            <Toast.Root
                className="ToastRoot ToastError"
                open={open}
                onOpenChange={setOpen}
            >
                <Toast.Title className="ToastTitle">
                    Screenshot already added at this time
                </Toast.Title>
            </Toast.Root>
            <Toast.Viewport className="ToastViewport" />
        </Toast.Provider>
    );
};

export default ErrorAddScreenshotToast;
