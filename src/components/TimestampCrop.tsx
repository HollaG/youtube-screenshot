import { AspectRatio, Box, Flex, Slider } from "@radix-ui/themes";
import { Component } from "react";
import * as portals from "react-reverse-portal";

const TimestampCrop = ({
    portalNode,
}: {
    portalNode: portals.HtmlPortalNode<Component<any>>;
}) => {
    return (
        <Flex direction={"column"} p={"4"}>
            {/* Video and Vertical Crop */}
            <Flex>
                <Box grow={"1"}>{/* Video */}</Box>
                <Box
                    shrink={"0"}
                    style={{
                        width: "64px",
                    }}
                >
                    <Slider defaultValue={[0, 100]} orientation="vertical" />
                </Box>
            </Flex>

            {/* Horizontal Crop */}
            <Flex>
                <Box
                    grow={"1"}
                    style={{
                        height: "64px",
                    }}
                >
                    <Slider defaultValue={[0, 100]} />
                </Box>
                <Box
                    style={{
                        width: "64px",
                        backgroundColor: "black",
                    }}
                    shrink={"0"}
                ></Box>
            </Flex>
        </Flex>
    );
};

export default TimestampCrop;
