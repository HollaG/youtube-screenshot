import "./TimestampList.css";

import { List, arrayMove } from "react-movable";
import { Box, Flex, Text } from "@radix-ui/themes";
import TimestampComponent from "./TimestampComponent";
import ReactPlayer from "react-player";
const TimestampList = ({
    timestamps,
    setTimestamps,
    videoId,
    onDelete,
    beginCrop,
}: {
    timestamps: number[];
    setTimestamps: React.Dispatch<React.SetStateAction<number[]>>;
    videoId: string;
    onDelete: (timestamp: number) => void;
    beginCrop: (timestamp: number) => void;
}) => {
    return (
        <Flex direction={"column"} width={"100%"} px={"4"}>
            <Text
                align="center"
                style={{ fontWeight: "bold" }}
                color="purple"
                size={"5"}
                mb={"2"}
            >
                {" "}
                Timestamps{" "}
            </Text>
            <Box>
                <List
                    values={timestamps}
                    onChange={({ oldIndex, newIndex }) => {
                        setTimestamps(
                            arrayMove(timestamps, oldIndex, newIndex)
                        );
                    }}
                    renderList={({ children, props }) => (
                        <Flex direction="column" gap="3" {...props}>
                            {children}
                        </Flex>
                    )}
                    renderItem={({ value, props }) => (
                        <div {...props}>
                            <TimestampComponent
                                timestamp={value}
                                onDelete={onDelete}
                                videoId={videoId}
                                beginCrop={beginCrop}
                            />
                        </div>
                    )}
                />
            </Box>
        </Flex>
    );
};

export default TimestampList;
