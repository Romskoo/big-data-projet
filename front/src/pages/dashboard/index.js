/**
 =========================================================
 * Soft UI Dashboard React - v4.0.0
 =========================================================

 * Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-react
 * Copyright 2022 Creative Tim (https://www.creative-tim.com)

 Coded by www.creative-tim.com

 =========================================================

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */

// @mui material components
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

// Soft UI Dashboard React examples
import DashboardLayout from "components/DashboardLayout";
import DashboardNavbar from "components/DashboardNavbar";
import Footer from "components/Footer";
import MiniStatisticsCard from "components/MiniStatisticsCard";






import statisticsService from "../../services/statistics-service";
import React, {useEffect, useState} from 'react';
import PieChart from "../../components/PieChart";
import VerticalBarChart from "../../components/BarCharts/VerticalBarChart";


function Dashboard() {
    const [datas, setDatas] = useState([]);
    const [datasGender, setDatasGender] = useState([]);
    const [datasDiseases, setDatasDiseases] = useState([]);
    const [datasUnits, setDatasUnits] = useState([]);

    useEffect(() => {
        statisticsService.countStates()
            .then(response => {
                setDatas(response.data)
            })
    }, [])

    useEffect(() => {
        statisticsService.countGenders()
            .then(response => {
                setDatasGender(response.data)
            })
    }, [])

    useEffect(() => {
        statisticsService.countDiseases()
            .then(response => {
                setDatasDiseases(response.data)
            })
    }, [])

    useEffect(() => {
        statisticsService.countUnits()
            .then(response => {
                setDatasUnits(response.data)
            })
    }, [])

    function getColorByLabel(label) {
        if (label === "VIVANT") {
            return "success"
        }
        if (label === "MORT") {
            return "error"
        }
        return "info"
    }

    function getIconByLabel(label) {
        if (label === "VIVANT") {
            return "done"
        }
        if (label === "MORT") {
            return "dangerous"
        }
        return "healing"
    }

    return (
        <DashboardLayout>
            <DashboardNavbar/>
            <SoftBox py={3}>
                <SoftBox mb={3}>
                    <Grid container spacing={3}>
                        {
                            datas.map((data) =>
                                <Grid key={data[0]} item xs={12} sm={6} xl={4}>
                                    <MiniStatisticsCard
                                        title={{text: data.label}}
                                        count={data.value}
                                        icon={{
                                            color: getColorByLabel(data.label),
                                            component: getIconByLabel(data.label)
                                        }}
                                    />
                                </Grid>
                            )
                        }
                    </Grid>
                </SoftBox>
                <SoftBox mb={3}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} lg={6}>
                            <PieChart title="Unité des patients" chart={{
                                labels: datasUnits.map(dataGender => dataGender.label),
                                datasets: {
                                    label: "Projects",
                                    backgroundColors: ["info", "success", "error"],
                                    data: datasUnits.map(dataGender => dataGender.value),
                                }
                            }}>
                            </PieChart>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <PieChart title="Sexe des patients" chart={{
                                labels: datasGender.map(dataGender => dataGender.label),
                                datasets: {
                                    label: "Projects",
                                    backgroundColors: ["info", "primary"],
                                    data: datasGender.map(dataGender => dataGender.value),
                                }
                            }}>
                            </PieChart>
                        </Grid>
                    </Grid>
                </SoftBox>
                <SoftBox mb={3}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} lg={12}>
                            <VerticalBarChart
                                title="Maladies détéctées"
                                chart={{
                                    labels: datasDiseases.map(dataGender => dataGender.label),
                                    datasets: [{
                                        label: "Maladie",
                                        color: "info",
                                        data: datasDiseases.map(dataGender => dataGender.value),
                                    }],
                                }}
                            />
                        </Grid>
                    </Grid>
                </SoftBox>
            </SoftBox>
            <Footer/>
        </DashboardLayout>
    );
}

export default Dashboard;
