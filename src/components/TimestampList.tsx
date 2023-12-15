import { List, arrayMove } from "react-movable";
import TimestampComponent from "./TimestampComponent";
import { Box, Flex, Text } from "@chakra-ui/react";

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
                fontSize={"xl"}
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
                    renderItem={({ value, props, index }) => (
                        <div {...props}>
                            <TimestampComponent
                                timestamp={value}
                                onDelete={onDelete}
                                videoId={videoId}
                                beginCrop={beginCrop}
                                index={index || -1}
                            />
                        </div>
                    )}
                />
            </Box>
        </Flex>
    );
};

export default TimestampList;
