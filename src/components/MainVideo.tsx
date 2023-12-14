import { Flex, Box, AspectRatio, Slider } from "@radix-ui/themes";
import ReactPlayer from "react-player";

const sliderWidth = "24px";

/**
 * Controls the display of the main viewing window.
 */
const MainVideo = ({
    mainPlayerRef,
    videoId,
    controls,
    isCropping,
    completeCrop,
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
    return (
        <Flex direction={"column"} p={"4"}>
            {/* Video and Vertical Crop */}
            <Flex>
                <Box
                    shrink={"0"}
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
                <Box grow={"1"}>
                    {/* Video */}
                    <Box
                        style={{
                            position: "relative",
                        }}
                    >
                        <AspectRatio ratio={16 / 9}>
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
                            <Slider
                                value={[controls.bottom, controls.bottomOffset]}
                                orientation="vertical"
                                onValueChange={([nb, nt]) => {
                                    controls.setBottomOffset(nt);
                                    controls.setBottom(nb);
                                }}
                            />
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
                    shrink={"0"}
                ></Box>
                <Flex
                    grow={"1"}
                    style={{
                        height: sliderWidth,
                    }}
                    align={"end"}
                >
                    <Box width={"100%"} style={{ transform: "scale(1.01)" }}>
                        {isCropping && (
                            <Slider
                                value={[controls.left, controls.leftOffset]}
                                onValueChange={([nl, nr]) => {
                                    console.log([nl, nr]);
                                    controls.setLeft(nl);
                                    controls.setLeftOffset(nr);
                                }}
                            />
                        )}
                    </Box>
                </Flex>
                <Box
                    style={{
                        width: sliderWidth,
                    }}
                    shrink={"0"}
                ></Box>
            </Flex>
        </Flex>
    );
};

export default MainVideo;
