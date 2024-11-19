import {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
} from "@chakra-ui/icons";
import {
    AspectRatio,
    Box,
    Button,
    ButtonGroup,
    Flex,
    Heading,
    RangeSlider,
    RangeSliderFilledTrack,
    RangeSliderThumb,
    RangeSliderTrack,
} from "@chakra-ui/react";
import ReactPlayer from "react-player";

export const sliderWidth = "24px";

/**
 * Controls the display of the main viewing window.
 */
const MainVideo = ({
    mainPlayerRef,
    videoId,
    controls,
    isCropping,
}: {
    mainPlayerRef: React.RefObject<ReactPlayer>;
    videoId: string;
    controls: {
        left: number;
        leftOffset: number;
        bottomOffset: number;
        bottom: number;
        setLeft: React.Dispatch<React.SetStateAction<number>>;
        setLeftOffset: React.Dispatch<React.SetStateAction<number>>;
        setBottomOffset: React.Dispatch<React.SetStateAction<number>>;
        setBottom: React.Dispatch<React.SetStateAction<number>>;
    };

    isCropping: boolean;
    completeCrop: () => void;
}) => {
    /**
     * Shifts the playhead by x seconds.
     *
     * @param seconds Seconds to jump forward / behind
     */
    const seek = (seconds: number) => {
        mainPlayerRef.current?.seekTo(
            mainPlayerRef.current.getCurrentTime() + seconds
        );
    };

    return (
        <Flex direction={"column"}>
            {/* Video and Vertical Crop */}
            <Flex>
                <Box
                    flexShrink={"0"}
                    style={{
                        width: sliderWidth,
                        zIndex: 100,
                    }}
                >
                    {/* <Slider
                defaultValue={[0, 100]}
                orientation="vertical"
            /> */}
                </Box>
                <Box flexGrow={"1"}>
                    {/* Video */}
                    <Box
                        style={{
                            position: "relative",
                        }}
                    >
                        <AspectRatio ratio={16 / 9} id="player-container">
                            <ReactPlayer
                                ref={mainPlayerRef}
                                url={`//www.youtube.com/embed/${videoId}`}
                                controls
                                width={"100%"}
                                height={"100%"}
                            />
                        </AspectRatio>
                        {isCropping && (
                            <Box
                                style={{
                                    position: "absolute",
                                    top: `${100 - controls.bottomOffset}%`,
                                    bottom: `${controls.bottom}%`,
                                    left: `${controls.left}%`,
                                    right: `${100 - controls.leftOffset}%`,
                                    backgroundColor: "red",
                                    opacity: 0.5,
                                }}
                            ></Box>
                        )}
                        {isCropping && (
                            <Flex
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    bottom: 0,
                                    left: "15%",
                                    right: "15%",
                                }}
                                justifyContent={"center"}
                                alignItems={"center"}
                            >
                                <Heading
                                    textAlign={"center"}
                                    textColor={"white"}
                                    // bgColor="grey.100"
                                >
                                    Adjust the Sliders at the edges of the video
                                    to choose your crop area!
                                </Heading>
                            </Flex>
                        )}
                    </Box>
                </Box>
                <Flex
                    shrink={"0"}
                    style={{
                        width: sliderWidth,
                    }}
                    justify={"end"}
                >
                    <Box style={{ transform: "scale(1.01)" }}>
                        {isCropping && (
                            <RangeSlider
                                size={"lg"}
                                aria-label={["min", "max"]}
                                value={[controls.bottom, controls.bottomOffset]}
                                orientation="vertical"
                                onChange={([nb, nt]) => {
                                    controls.setBottomOffset(nt);
                                    controls.setBottom(nb);
                                }}
                                colorScheme="teal"
                            >
                                <RangeSliderTrack>
                                    <RangeSliderFilledTrack />
                                </RangeSliderTrack>
                                <RangeSliderThumb
                                    index={0}
                                    boxSize={6}
                                    bgColor={"teal"}
                                >
                                    {" "}
                                    <ChevronDownIcon color={"white"} />
                                </RangeSliderThumb>

                                <RangeSliderThumb
                                    index={1}
                                    boxSize={6}
                                    bgColor={"teal"}
                                >
                                    <ChevronUpIcon color={"white"} />
                                </RangeSliderThumb>
                            </RangeSlider>
                        )}
                    </Box>
                </Flex>
            </Flex>

            {/* Horizontal Crop */}
            <Flex>
                <Box
                    style={{
                        width: sliderWidth,
                    }}
                    flexShrink={"0"}
                ></Box>
                <Flex
                    grow={"1"}
                    style={{
                        height: sliderWidth,
                    }}
                    alignItems={"end"}
                >
                    <Box width={"100%"}>
                        {isCropping && (
                            <RangeSlider
                                aria-label={["min", "max"]}
                                value={[controls.left, controls.leftOffset]}
                                onChange={([nl, nr]) => {
                                    controls.setLeft(nl);
                                    controls.setLeftOffset(nr);
                                }}
                                colorScheme="teal"
                                size={"lg"}
                            >
                                <RangeSliderTrack>
                                    <RangeSliderFilledTrack />
                                </RangeSliderTrack>
                                <RangeSliderThumb
                                    index={0}
                                    boxSize={6}
                                    bgColor="teal"
                                >
                                    <ChevronLeftIcon color="white" />
                                </RangeSliderThumb>
                                <RangeSliderThumb
                                    index={1}
                                    boxSize={6}
                                    bgColor={"teal"}
                                >
                                    <ChevronRightIcon color={"white"} />
                                </RangeSliderThumb>
                            </RangeSlider>
                        )}
                    </Box>
                </Flex>
                <Box
                    style={{
                        width: sliderWidth,
                    }}
                    flexShrink={"0"}
                ></Box>
            </Flex>
            <ButtonGroup variant="outline" size="sm" colorScheme="teal">
                <Flex justifyContent={"center"} gap={2} w="100%">
                    <Button onClick={() => seek(-10)}> -10s </Button>
                    <Button onClick={() => seek(-5)}> -5s </Button>
                    <Button onClick={() => seek(-1)}> -1s </Button>
                    <Button onClick={() => seek(1)}> +1s </Button>
                    <Button onClick={() => seek(5)}> +5s </Button>
                    <Button onClick={() => seek(10)}> +10s </Button>
                </Flex>
            </ButtonGroup>
        </Flex>
    );
};

export default MainVideo;
