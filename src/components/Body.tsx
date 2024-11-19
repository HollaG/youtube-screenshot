import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import TimestampList from "./TimestampList";

import download from "downloadjs";
import MainVideo, { sliderWidth } from "./MainVideo";

import {
    Box,
    Button,
    Center,
    Container,
    Flex,
    FormControl,
    FormErrorMessage,
    Heading,
    Image,
    Input,
    Text,
    ToastProps,
    useBoolean,
    useToast,
} from "@chakra-ui/react";
import sanitize from "sanitize-filename";

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
    const [videoErrorMessage, setVideoErrorMessage] = useState("");
    const [isLoadingVideoInfo, setIsLoadingVideoInfo] = useState(false);
    const [videoName, setVideoName] = useState("");

    const searchUrl = () => {
        // check the url
        setIsLoadingVideoInfo(true);
        fetch(`${SERVER_URL}/info?url=${urlRef.current?.value}`, {})
            .then((res) => res.json())
            .then((resp) => {
                // validate if this video can be used
                if (resp.error) {
                    setVideoErrorMessage(resp.message);
                    return;
                }

                if (
                    resp.data.lengthSeconds &&
                    Number(resp.data.lengthSeconds) > 45 * 60
                ) {
                    // 45 minutes
                    setVideoErrorMessage(
                        "Video is longer than 45 minutes! This is not allowed."
                    );
                    return;
                }

                // otherwise ok :)
                setUrl(urlRef.current?.value || "");
                setTimestamps([]);
                setCropSettings({});
                setVideoErrorMessage("");
                setVideoName(resp.data.title);
            })
            .finally(() => {
                setIsLoadingVideoInfo(false);
            });
    };

    // list of selected timestamps
    const [timestamps, setTimestamps] = useState<number[]>([]);

    const videoId = getId(url);
    const mainPlayerRef = useRef<ReactPlayer>(null);

    // remaining downloads for today
    type Quota = {
        remaining: number;
        resetTimeMs: number;
    };
    const [quota, setQuota] = useState<Quota>({
        remaining: 10,
        resetTimeMs: Date.now() + 24 * 60 * 60 * 1000,
    });

    const [showScreenshotPreviews, setShowScreenshotPreviews] = useBoolean();

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
            if (quota.remaining === 0) {
                reject({
                    message:
                        "You have hit your limit of 10 downloads per day! Please try again in 24 hours.",
                });
            }
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
                .then((res) => {
                    // try res.json()
                    if (res.status === 429) {
                        // too many requests
                        throw new Error(
                            "You have hit your limit of 10 downloads per day! Please try again in 24 hours."
                        );
                    }

                    return res.blob();
                })
                .then((blob) => {                    
                    download(blob, sanitize(videoName) + ".pdf");
                    updateQuota();
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
            error: (err) => ({
                title: "Error processing video!",
                description: err.message,
                ...DEFAULT_TOAST_OPTIONS,
            }),
            loading: {
                title: "File processing & downloading",
                description: "Please wait, this can take a while...",
                ...DEFAULT_TOAST_OPTIONS,
                isClosable: false,
            },
        });
    };

    /* ---------------- CROP CONTROLS ---------------- */
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

    /**
     * Begin cropping
     *
     * @param timestamp The timestamp that the user wants to crop
     */
    const beginCrop = (timestamp: number) => {
        mainPlayerRef.current?.seekTo(timestamp);
        setIsCropping(true);
        setCurrentCropTimestamp(timestamp);

        // scrollTo({
        //     top: 0,
        //     behavior: "smooth",
        // });

        document.getElementById("player-container")?.scrollIntoView({
            behavior: "smooth",
        });

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

    /**
     * Apply the selected crop area to only the current image
     *
     * @param timestamp The timestamp to crop
     * @param isAll A flag to indicate if we are using this function internally in #cropAll. If we are, we do not
     * display the Toast that indicates success
     */
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

    /**
     * Apply the selected crop area to all images
     */
    const cropAll = () => {
        for (const timestamp of timestamps) {
            cropOne(timestamp, true);
        }
        toast({
            title: "Cropped all images",
            status: "success",
            ...DEFAULT_TOAST_OPTIONS,
        });
    };

    /**
     * Cancel crop mode
     */
    const cropCancel = () => {
        setIsCropping(false);
    };

    // Rate limiting
    useEffect(() => {
        updateQuota();
    }, []);

    const updateQuota = useCallback(() => {
        fetch(SERVER_URL)
            .then((res) => res.json())
            .then((data) => {
                setQuota({
                    remaining: data.remaining,
                    resetTimeMs: new Date(data.resetTime).getTime(),
                });
            });
    }, [SERVER_URL, setQuota]);

    return (
        <Container
            maxW="container.xl"
            centerContent
            mx={"auto"}
            my={"9"}
            mt={16}
        >
            <Flex direction={"column"} gap="4" width={"100%"}>
                <Heading
                    textAlign={"center"}
                    fontWeight={600}
                    fontSize={{ base: "4xl", md: "6xl" }}
                    lineHeight={"110%"}
                    mb={6}
                >
                    {" "}
                    Youtube Screenshot Tool 📸
                </Heading>
                <Center>
                    <Text
                        maxW={"container.md"}
                        textAlign={"center"}
                        fontSize={"lg"}
                    >
                        YT2PDF allows you to download screenshots from any
                        Youtube video and compile them into a PDF for easy
                        viewing! You'll also receive all the individual images
                        when downloading.
                    </Text>
                </Center>
                <Center>
                    <Text
                        maxW={"container.md"}
                        textAlign={"center"}
                        fontSize={"lg"}
                    >
                        Simply paste in the URL to the Youtube video in the text
                        box below.
                    </Text>
                </Center>

                <Center>
                    <Text
                        maxW={"container.md"}
                        textAlign={"center"}
                        fontSize={"md"}
                        textColor={"red"}
                    >
                        Videos must be under 45 minutes in length, and cannot be
                        Youtube Shorts.
                    </Text>
                </Center>
                <Center>
                    <Text
                        maxW={"container.md"}
                        textAlign={"center"}
                        fontSize={"sm"}
                        textColor={"red"}
                    >
                        You have <b>{quota.remaining}</b> downloads remaining.
                        Resets on {new Date(quota.resetTimeMs).toLocaleString()}
                    </Text>
                </Center>
                <Center>
                    <Image
                        src={`${SERVER_URL}/guide.png`}
                        alt="A visual guide on how yt2pdf works"
                    />
                </Center>
                <Box px={sliderWidth}>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <FormControl isInvalid={videoErrorMessage !== ""}>
                            <Flex gap={"4"}>
                                <Box flexGrow={"1"}>
                                    <Input
                                        placeholder="Paste a Youtube URL…"
                                        ref={urlRef}
                                    />
                                </Box>
                                <Box>
                                    <Button
                                        colorScheme="teal"
                                        onClick={searchUrl}
                                        type="submit"
                                        isLoading={isLoadingVideoInfo}
                                    >
                                        Search
                                    </Button>
                                </Box>
                            </Flex>
                            <FormErrorMessage>
                                {videoErrorMessage}
                            </FormErrorMessage>
                        </FormControl>
                    </form>
                </Box>
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
                            <Flex gap={3}>
                                <Button
                                    onClick={addScreenshot}
                                    isDisabled={!videoId}
                                    colorScheme="teal"
                                >
                                    Add Screenshot at current time
                                </Button>
                                <Button
                                    onClick={setShowScreenshotPreviews.toggle}
                                    isDisabled={!videoId}
                                    display={{ base: "none", md: "block" }}
                                >
                                    {showScreenshotPreviews
                                        ? "Hide screenshot previews"
                                        : "Show screenshot previews"}
                                </Button>
                            </Flex>
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
                            showScreenshotPreviews={showScreenshotPreviews}
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
            {/* <Center mt={24}>
                <Text>
                    {" "}
                    Made by Marcus Soh |{" "}
                    <Link isExternal href="https://marcussoh.com">
                        {" "}
                        Website{" "}
                    </Link>
                </Text>
            </Center> */}
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
