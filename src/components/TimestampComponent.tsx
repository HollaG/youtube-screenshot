import { convertToSecondsWithTwoDp } from "./Body";
import ReactPlayer from "react-player";
import { useState } from "react";
import { AspectRatio, Box, Button, Flex, Text } from "@chakra-ui/react";
import { DragHandleIcon } from "@chakra-ui/icons";

const TimestampComponent = ({
    timestamp,
    onDelete,
    videoId,
    beginCrop,
    showScreenshotPreviews,
}: {
    timestamp: number;
    onDelete: (timestamp: number) => void;
    videoId: string;
    beginCrop: (timestamp: number) => void;
    index: number;

    showScreenshotPreviews: boolean;
}) => {
    const [isPlaying, setIsPlaying] = useState(true);

    return (
        <Flex direction={"column"}>
            <Flex gap={"6"} justify={"between"} align="center">
                <Box
                    style={{
                        maxWidth: "500px",
                        maxHeight: "500px",
                        minWidth: "250px",
                    }}
                    flexGrow={"1"}
                    display={{
                        base: "none",
                        md: showScreenshotPreviews ? "block" : "none",
                    }}
                >
                    <AspectRatio ratio={16 / 9}>
                        {showScreenshotPreviews ? (
                            <ReactPlayer
                                url={`//www.youtube.com/embed/${videoId}?start=${timestamp}&rel=0`}
                                volume={0}
                                playing={isPlaying}
                                playbackRate={0}
                                onPlay={() => {
                                    setIsPlaying(true);

                                    setTimeout(() => setIsPlaying(false), 0);
                                }}
                                width={"100%"}
                                height="100%"
                            />
                        ) : (
                            <></>
                        )}
                    </AspectRatio>
                </Box>
                <Box width="100%" flexShrink={"1"}>
                    <Flex gap={"4"} align={"center"}>
                        {/* <DragHandleDots2Icon height="32" width="32" /> */}
                        <DragHandleIcon />
                        <Text size="xl" style={{ flexGrow: 1 }}>
                            {convertToSecondsWithTwoDp(timestamp)}s{" "}
                        </Text>
                        <Flex gap={"2"}>
                            <Box>
                                <Button
                                    size={{ base: "xs", sm: "sm", md: "md" }}
                                    onClick={() => beginCrop(timestamp)}
                                    colorScheme="teal"
                                >
                                    {" "}
                                    Crop{" "}
                                </Button>
                            </Box>
                            <Box>
                                <Button
                                    size={{ base: "xs", sm: "sm", md: "md" }}
                                    onClick={() => onDelete(timestamp)}
                                    colorScheme="red"
                                >
                                    {" "}
                                    Delete{" "}
                                </Button>
                            </Box>
                        </Flex>
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    );
};

export default TimestampComponent;
