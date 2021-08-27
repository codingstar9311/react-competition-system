import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Image
} from "@react-pdf/renderer";
import {COLOR_DLG_BORDER_BLUE} from "../../Utils/ColorConstants";

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#ffffff",
        paddingLeft: 15,
        paddingRight: 15
    },
    headerTitle: {
        paddingTop: 50,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bolder',
        color: COLOR_DLG_BORDER_BLUE,
    },
    header: {
        padding: 10,
        display: "flex",
        flexDirection: "row",
        backgroundColor: '#ddd',
        borderBottom: 'solid 2px #6f6f6f'
    },
    headerItem: {
        padding: 2,
        backgroundColor: COLOR_DLG_BORDER_BLUE,
        },
    headerText: {
        fontSize: 8,
        fontWeight: 'bolder'
        },
    tableCell: {
        padding: 2,
    },
    bodyText: {
        fontSize: 8
    },
    tableRow: {
        padding: 10,
        display: "flex",
        flexDirection: "row",
        borderBottom: 'solid 1px #6f6f6f'
    }
});

const CompetitionPdf = (props) => {
    console.log(props.data);
    return (
        <Document orientation="landscape">
            <Page style={styles.page}>
                <View style={styles.headerTitle}>
                    <Text>Scored Competition List</Text>
                </View>
                <View style={styles.header}>
                {
                    props.header && props.header.map((item, key) => {
                        if (['no', 'grade', 'problemCount', 'limitTime',  'warningCount', 'limitWarningCount'].includes(item.id)) {
                            return (
                                <View style={{
                                    padding: 2,
                                    width: '8%',
                                    textAlign: 'center',
                                }} key={key}>
                                    <Text style={styles.headerText}>{item.label}</Text>
                                </View>
                            )
                        } else if (item.id == 'fullName'){
                            return (
                                <View style={{
                                    padding: 2,
                                    width: '11%'
                                }} key={key}>
                                    <Text style={styles.headerText}>{item.label}</Text>
                                </View>
                            )
                        } else if (item.id === 'startedAt') {
                            return (
                                <View style={{
                                    padding: 2,
                                    width: '15%'
                                }} key={key}>
                                    <Text style={styles.headerText}>{item.label}</Text>
                                </View>
                            )
                        } else if (item.id === 'competitionName') {
                            return (
                                <View style={{
                                    padding: 2,
                                    width: '13%',
                                    textAlign: 'center'
                                }} key={key}>
                                    <Text style={styles.headerText}>
                                        {item.label}
                                    </Text>
                                </View>
                            )
                        } else if (item.id == 'score') {
                            return (
                                <View style={{
                                    padding: 2,
                                    width: '13%',
                                    textAlign: 'right'
                                }} key={key}>
                                    <Text style={styles.headerText}>{item.label}</Text>
                                </View>
                            )
                        }
                    })
                }
                </View>
                {
                    props.data && props.data.map((dataItem, key) => {
                        return (
                            <View style={styles.tableRow} key={key}>
                                {
                                    props.header.map((item, headeryKey) => {
                                        if (['no', 'grade', 'problemCount', 'limitTime', 'warningCount', 'limitWarningCount'].includes(item.id)) {
                                            return (
                                                <View style={{
                                                    padding: 2,
                                                    width: '8%',
                                                    textAlign: 'center'
                                                }} key={headeryKey}>
                                                    <Text style={styles.bodyText}>{dataItem[item.id]}</Text>
                                                </View>
                                            )
                                        } else if (item.id == 'fullName'){
                                            return (
                                                <View
                                                    style={{
                                                    padding: 2,
                                                    width: '11%'
                                                }} key={headeryKey}>
                                                    <Text style={styles.bodyText}>{dataItem[item.id]}</Text>
                                                </View>
                                            )
                                        } else if (item.id === 'startedAt') {
                                            return (
                                                <View style={{
                                                    padding: 2,
                                                    width: '15%'
                                                }} key={headeryKey}>
                                                    <Text style={styles.bodyText}>{new Date(dataItem[item.id].seconds * 1000).toLocaleString()}</Text>
                                                </View>
                                            )
                                        }
                                        else if (item.id === 'competitionName') {
                                            return (
                                                <View style={{
                                                    padding: 2,
                                                    width: '13%',
                                                    textAlign: 'center'
                                                }} key={headeryKey}>
                                                    <Text style={styles.bodyText}>
                                                        {dataItem[item.id]}
                                                    </Text>
                                                </View>
                                            )
                                        } else if (item.id == 'score') {
                                            return (
                                                <View style={{
                                                    padding: 2,
                                                    width: '13%',
                                                    textAlign: 'right'
                                                }} key={headeryKey}>
                                                    <Text style={styles.bodyText}>{dataItem[item.id]}</Text>
                                                </View>
                                            )
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
