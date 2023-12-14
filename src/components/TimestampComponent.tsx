import {
    Cross2Icon,
    DragHandleDots2Icon,
    RowSpacingIcon,
} from "@radix-ui/react-icons";
import { AspectRatio, Box, Button, Flex, Grid, Text } from "@radix-ui/themes";
import { convertToSecondsWithTwoDp } from "./Body";
import ReactPlayer from "react-player";
import { useMemo, useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as portals from "react-reverse-portal";
import TimestampCrop from "./TimestampCrop";

import "./TimestampComponent.css";

const TimestampComponent = ({
    timestamp,
    onDelete,
    videoId,
    beginCrop,
}: {
    timestamp: number;
    onDelete: (timestamp: number) => void;
    videoId: string;
    beginCrop: (timestamp: number) => void;
}) => {
    const [isPlaying, setIsPlaying] = useState(true);

    const [open, setOpen] = useState(false);

    const portalNode = useMemo(() => portals.createHtmlPortalNode(), []);

    return (
        <Flex direction={"column"}>
            <portals.InPortal node={portalNode}>
                <AspectRatio ratio={16 / 9}>
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
                </AspectRatio>
            </portals.InPortal>
            <Flex gap={"6"} justify={"between"} align="center">
                <Box
                    style={{
                        maxWidth: "500px",
                        maxHeight: "500px",
                        minWidth: "250px",
                    }}
                    grow={"1"}
                >
                    <portals.OutPortal node={portalNode}></portals.OutPortal>
                </Box>
                <Box width="100%" shrink={"1"}>
                    <Flex gap={"4"} align={"center"}>
                        <DragHandleDots2Icon height="32" width="32" />
                        <Text size="5" style={{ flexGrow: 1 }}>
                            {convertToSecondsWithTwoDp(timestamp)}s{" "}
                        </Text>
                        <Flex gap={"2"}>
                            <Box>
                                <Button
                                    size="1"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => beginCrop(timestamp)}
                                >
                                    {" "}
                                    Crop{" "}
                                </Button>
                            </Box>
                            <Box>
                                <Button
                                    size="1"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => onDelete(timestamp)}
                                    color="red"
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
