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
import Card from "@mui/material/Card";


// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftBadge from "components/SoftBadge";

// Soft UI Dashboard React examples
import DashboardLayout from "components/DashboardLayout";
import Footer from "components/Footer";
import ProfileInfoCard from "components/ProfileInfoCard";
import { useLocation } from 'react-router-dom';
import { useEffect,useState } from "react";
import PatientsService from "../../services/patients-service";



// Images
function Overview() {
  let location = useLocation();
  let state = location.state

  const [id,setId] = useState();
  const [patient,setPatient] = useState({prenom:'Jonathan',nom:'JUSSEAUME',genre:'Non-binaire',naissance:'2001-12-20',taille:'1.75',poids:'200',etat:'MORT',proba:0,maladies:['test','afazf']});

  useEffect(()=>{
    if(state !== null){
      if(state.id !== undefined)
        setId(state.id)
    }

  },[state])

  useEffect(()=>{
    if(id !== undefined){
      PatientsService.getPatientById({id:id})
      .then(response => {
        let rep = response.data
        setPatient({nom:rep.lastName,prenom:rep.firstName,genre:rep.gender,naissance:rep.birthDate.substring(0, 10),taille:rep.height,poids:rep.weight,etat:rep.state,proba:rep.aliveProba,maladies:rep.diseases})
      })
    }   
  },[id])

  const handleClickTuer = () =>{
    PatientsService.changeEtatPatient({id:id,etat:'MORT'})
      .then(setPatient({nom:patient.nom,prenom:patient.prenom,genre:patient.genre,naissance:patient.naissance,taille:patient.taille,poids:patient.poids,etat:'MORT',proba:0,maladies:patient.maladies}))
  }

  const handleClickSauver = () =>{
    PatientsService.changeEtatPatient({id:id,etat:'VIVANT'})
      .then(setPatient({nom:patient.nom,prenom:patient.prenom,genre:patient.genre,naissance:patient.naissance,taille:patient.taille,poids:patient.poids,etat:'VIVANT',proba:1,maladies:patient.maladies}))
  }

  function BadgePatient({aliveProba,etat}){
    if(etat === 'VIVANT'){
      return(
        <SoftBadge variant="gradient" badgeContent='VIVANT' color="success" size="xs" container />
      )
    }
    else if(etat === 'MORT'){
      return(      
        <SoftBadge variant="gradient" badgeContent='MORT' color="warning" size="xs" container />
      )
    }else{
      return(
        <SoftBadge variant="gradient" badgeContent={(aliveProba * 100) + "%"} color="info" size="xs" container />
      )
    }
  }

  return (
    <DashboardLayout>
      <SoftBox mt={5} mb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} xl={4}>
          </Grid>
          <Grid item xs={12} md={6} xl={4}>
            <Card>
              <SoftBox style={{'padding':'2em'}}>
                <SoftTypography variant="h4" fontWeight="medium">
                  Informations du patient :
                </SoftTypography>
                <br/>
                <SoftTypography variant="h6" fontWeight="medium">
                  Nom : {patient.nom}
                </SoftTypography>
                <SoftTypography variant="h6" fontWeight="medium">
                  Prenom : {patient.prenom}
                </SoftTypography>
                <SoftTypography variant="h6" fontWeight="medium">
                  Genre : {patient.genre}
                </SoftTypography>
                <SoftTypography variant="h6" fontWeight="medium">
                  Naissance : {patient.naissance}
                </SoftTypography>
                <SoftTypography variant="h6" fontWeight="medium">
                  Taille : {patient.taille}
                </SoftTypography>
                <SoftTypography variant="h6" fontWeight="medium">
                  Poids : {patient.poids}
                </SoftTypography>
                <SoftTypography variant="h6" fontWeight="medium">
                  Chance de suivie : {BadgePatient({aliveProba:patient.proba,etat:patient.etat})}
                </SoftTypography>
                {
                  (patient.etat !== 'VIVANT' && patient.etat !== 'MORT') ? <SoftBox className="pointer" style={{'display':'flex','justifyContent':'center', 'margin':'1em'}}><SoftBadge  style={{'marginRight':'1em'}} variant="gradient" badgeContent='LE PATIENT EST VIVANT' color="success" size="xs" container onClick={handleClickSauver} /><SoftBadge variant="gradient" className="pointer" badgeContent='LE PATIENT EST MORT' color="warning" size="xs" container onClick={handleClickTuer} /></SoftBox>
                  : <div></div>    
                }
                
              </SoftBox>
              
            </Card>
          </Grid>
          <Grid item xs={12} xl={4}>
          </Grid>
        </Grid>
      </SoftBox>
      <SoftBox mb={3}>
        <Card>
          <SoftBox pt={2} px={2}>
            <SoftBox mb={0.5}>
              <SoftTypography variant="h6" fontWeight="medium">
                Maladies du patient :
              </SoftTypography>
            </SoftBox>
            <SoftBox mb={1}>
              
                {patient.maladies.map((maladie) =>
                  <SoftTypography variant="button" fontWeight="regular" color="text">
                    {maladie+", "}
                  </SoftTypography>
                )}
              
            </SoftBox>
          </SoftBox>
          <SoftBox p={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} xl={3}>
              </Grid>
              <Grid item xs={12} md={6} xl={3}>

              </Grid>
              <Grid item xs={12} md={6} xl={3}>

              </Grid>
              <Grid item xs={12} md={6} xl={3}>
              </Grid>
            </Grid>
          </SoftBox>
        </Card>
      </SoftBox>

      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
