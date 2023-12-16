import { useRef, useState } from "react";
import ReactPlayer from "react-player";
import TimestampList from "./TimestampList";

import download from "downloadjs";
import MainVideo from "./MainVideo";

import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Input,
    ToastProps,
    useToast,
} from "@chakra-ui/react";

const LEFT_DEFAULT = 0;
const LEFT_OFFSET_DEFAULT = 100;
const BOTTOM_DEFAULT = 0;
const BOTTOM_OFFSET_DEFAULT = 100;

const DEFAULT_TOAST_OPTIONS: ToastProps = {
    isClosable: true,
    position: "bottom-right",
};

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const Body = () => {
    // toasts
    const toast = useToast();
    const urlRef = useRef<HTMLInputElement>(null);
    // youtube url
    const [url, setUrl] = useState("");

    const searchUrl = () => {
        setUrl(urlRef.current?.value || "");
        setTimestamps([]);
        setCropSettings({});
    };

    // list of selected timestamps
    const [timestamps, setTimestamps] = useState<number[]>([]);

    const videoId = getId(url);
    const mainPlayerRef = useRef<ReactPlayer>(null);

    const addScreenshot = () => {
        if (!mainPlayerRef.current) return;
        const currentTime = mainPlayerRef.current.getCurrentTime();

        if (timestamps.includes(currentTime)) {
            toast({
                status: "error",
                title: "Screenshot at this timestamp already added!",
                ...DEFAULT_TOAST_OPTIONS,
            });
            return;
        }

        // add this in the timestamps, sorted by time.
        setTimestamps((prev) => [...prev, currentTime]);
        toast({
            status: "success",

            title: "Added screenshot!",
            ...DEFAULT_TOAST_OPTIONS,
        });
    };

    const removeScreenshot = (timestamp: number) => {
        // remove from timestamp list

        setTimestamps((prev) => prev.filter((t) => t != timestamp));

        toast({
            title: "Deleted screenshot",
            description: `Timestamp: ${convertToSecondsWithTwoDp(timestamp)}s`,
            status: "success",
            ...DEFAULT_TOAST_OPTIONS,
        });
    };

    const [isLoading, setIsLoading] = useState(false);

    const downloadPDF = async () => {
        setIsLoading(true);
        const downloadPromise = new Promise((resolve, reject) => {
            fetch(SERVER_URL, {
                method: "POST",
                body: JSON.stringify({
                    url,
                    timestamps,
                    cropSettings,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((res) => res.blob())
                .then((blob) => {
                    download(blob);
                    resolve(null);
                })
                .catch((e) => {
                    reject(e);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        });

        toast.promise(downloadPromise, {
            success: {
                title: "Processing complete.",
                description: "Your file is now downloading!",
                ...DEFAULT_TOAST_OPTIONS,
            },
            error: {
                title: "Error processing the video!",
                description: "Something went wrong! Please try again later.",
                ...DEFAULT_TOAST_OPTIONS,
            },
            loading: {
                title: "File processing & downloading",
                description: "Please wait...",
                ...DEFAULT_TOAST_OPTIONS,
                isClosable: false,
            },
        });
    };

    // -------- Controls for the crop
    const [cropSettings, setCropSettings] = useState<{
        [timestamp: number]: {
            left: number;
            leftOffset: number;
            bottom: number;
            bottomOffset: number;
        };
    }>({});

    const [currentCropTimestamp, setCurrentCropTimestamp] = useState<
        number | null
    >(null);
    const [left, setLeft] = useState(LEFT_DEFAULT);
    const [leftOffset, setLeftOffset] = useState(LEFT_OFFSET_DEFAULT);
    const [bottomOffset, setBottomOffset] = useState(BOTTOM_OFFSET_DEFAULT);
    const [bottom, setBottom] = useState(BOTTOM_DEFAULT);

    const [isCropping, setIsCropping] = useState(false);

    const beginCrop = (timestamp: number) => {
        mainPlayerRef.current?.seekTo(timestamp);
        setIsCropping(true);
        setCurrentCropTimestamp(timestamp);

        if (cropSettings[timestamp]) {
            setLeft(cropSettings[timestamp].left);
            setBottom(cropSettings[timestamp].bottom);
            setLeftOffset(cropSettings[timestamp].leftOffset);
            setBottomOffset(cropSettings[timestamp].bottomOffset);
        } else {
            setLeft(LEFT_DEFAULT);
            setLeftOffset(LEFT_OFFSET_DEFAULT);
            setBottom(BOTTOM_DEFAULT);
            setBottomOffset(BOTTOM_OFFSET_DEFAULT);
        }
    };

    const controls = {
        left,
        leftOffset,
        bottomOffset,
        bottom,
        setLeft,
        setLeftOffset,
        setBottomOffset,
        setBottom,
    };

    const cropOne = (timestamp: number | null, isAll?: boolean) => {
        if (timestamp === null) {
            setIsCropping(false);
            return;
        }
        setCropSettings((prev) => ({
            ...prev,
            [timestamp]: {
                left,
                leftOffset,
                bottom,
                bottomOffset,
            },
        }));
        setIsCropping(false);

        if (!isAll) {
            toast({
                title: `Cropped image`,
                description: `Timestamp: ${convertToSecondsWithTwoDp(
                    timestamp
                )}s`,
                status: "success",
                ...DEFAULT_TOAST_OPTIONS,
            });
        }
    };

    const cropAll = () => {
        console.log(timestamps);
        for (const timestamp of timestamps) {
            cropOne(timestamp, true);
        }
        toast({
            title: "Cropped all images",
            status: "success",
            ...DEFAULT_TOAST_OPTIONS,
        });
    };

    const cropCancel = () => {
        setIsCropping(false);
    };

    return (
        <Container maxW="container.xl" centerContent mx={"auto"} my={"9"}>
            <Flex direction={"column"} gap="6" width={"100%"}>
                <Heading textAlign={"center"}> Youtube Screenshot Tool</Heading>
                <Flex gap={"4"}>
                    <Box flexGrow={"1"}>
                        <Input
                            placeholder="Paste a Youtube URL…"
                            ref={urlRef}
                        />
                    </Box>
                    <Box>
                        <Button colorScheme="teal" onClick={searchUrl}>
                            Search
                        </Button>
                    </Box>
                </Flex>

                <MainVideo
                    mainPlayerRef={mainPlayerRef}
                    videoId={videoId || ""}
                    controls={controls}
                    isCropping={isCropping}
                    completeCrop={() => null}
                />
                <Box>
                    <Flex gap={"4"} justify={"center"}>
                        {!isCropping ? (
                            <Button
                                onClick={addScreenshot}
                                isDisabled={!videoId}
                                colorScheme="teal"
                            >
                                Add Screenshot at current time
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={() =>
                                        cropOne(currentCropTimestamp)
                                    }
                                    colorScheme="teal"
                                >
                                    Crop just this frame
                                </Button>
                                <Button onClick={cropAll} colorScheme="teal">
                                    Crop all
                                </Button>
                                <Button onClick={cropCancel} colorScheme="red">
                                    Cancel
                                </Button>
                            </>
                        )}
                    </Flex>
                </Box>
                <Flex justify="between">
                    <Box flexGrow={"1"}>
                        <TimestampList
                            timestamps={timestamps}
                            setTimestamps={setTimestamps}
                            videoId={videoId || ""}
                            onDelete={removeScreenshot}
                            beginCrop={beginCrop}
                        />
                    </Box>
                </Flex>
                <Box>
                    <Flex justify={"center"} gap={"8"}>
                        <Button
                            onClick={downloadPDF}
                            isDisabled={!timestamps.length}
                            colorScheme="teal"
                            isLoading={isLoading}
                        >
                            {" "}
                            Download PDF{" "}
                        </Button>
                    </Flex>
                </Box>
            </Flex>
        </Container>
    );
};

function getId(url: string) {
    const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Converts a decimal time obtained from `getCurrentTime()` into a format recognisable by Youtube Embed
 *
 * @param time The time to convert
 * @returns
 */
export function convertToSecondsWithTwoDp(time: number) {
    return Math.round(time * 100) / 100;
}

export default Body;
