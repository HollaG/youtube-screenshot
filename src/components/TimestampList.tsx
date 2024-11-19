import { List, arrayMove } from "react-movable";
import TimestampComponent from "./TimestampComponent";
import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";

const TimestampList = ({
    timestamps,
    setTimestamps,
    videoId,
    onDelete,
    beginCrop,
    showScreenshotPreviews,
}: {
    timestamps: number[];
    setTimestamps: React.Dispatch<React.SetStateAction<number[]>>;
    videoId: string;
    onDelete: (timestamp: number) => void;
    beginCrop: (timestamp: number) => void;
    showScreenshotPreviews: boolean;
}) => {
    const dragColor = useColorModeValue("gray.100", "gray.700");

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
                    renderItem={({
                        value,
                        props,
                        index,
                        isDragged,
                        isSelected,
                    }) => (
                        <Box
                            {...props}
                            bgColor={
                                isSelected || isDragged ? dragColor : undefined
                            }
                            boxShadow="0 5px 15px rgba(0,0,0,0.03)"
                            p={2}
                            borderRadius={"md"}
                        >
                            <TimestampComponent
                                timestamp={value}
                                onDelete={onDelete}
                                videoId={videoId}
                                beginCrop={beginCrop}
                                index={index || -1}
                                showScreenshotPreviews={showScreenshotPreviews}
                            />
                        </Box>
                    )}
                />
            </Box>
        </Flex>
    );
};

export default TimestampList;
