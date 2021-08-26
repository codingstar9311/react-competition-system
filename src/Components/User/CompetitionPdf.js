import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Image
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#ffffff",
    },
    header: {
        padding: 10,
        display: "flex",
        flexDirection: "row",
    },
    headerItem: {
        padding: 2,
        minWidth: 40
        },
    headerText: {
        fontSize: 10,
        fontWeight: 'bolder'
        },
    tableCell: {
        padding: 2,
    },
    bodyText: {
        fontSize: 10
    },
    tableRow: {
        paddingTop: 2,
        display: 'flex',
        flexDirection: 'row'
    }
});

const CompetitionPdf = (props) => {
    console.log(props.data);
    return (
        <Document size="landscape">
            <Page style={styles.page}>
                <View style={styles.header}>
                {
                    props.header && props.header.map((item, key) => {
                        return (
                            <View style={styles.headerItem} key={key}>
                                <Text style={styles.headerText}>{item.label}</Text>
                            </View>
                        )
                    })
                }
                </View>
                {
                    props.data && props.data.map((dataItem, key) => {
                        return (
                            <View style={styles.tableRow} key={key}>
                                {
                                    props.header.map((headerItem, headeryKey) => {
                                        if (['no', 'fullName', 'competitionName', 'grade', 'limitTime', 'limitWarningCount', 'warningCount'].includes(headerItem.id)) {
                                            return (
                                                <View style={styles.tableCell} key={headeryKey}>
                                                    <Text style={styles.bodyText} >{dataItem[headerItem.id] ? dataItem[headerItem.id] : ''}</Text>
                                                </View>
                                            )
                                        } else {

                                        }

                                    })
                                }
                            </View>
                        )
                    })
                }
            </Page>
        </Document>
        )
};

export default CompetitionPdf;
