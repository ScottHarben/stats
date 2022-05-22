import React, { useState, useEffect, Fragment } from "react";
import Table from "./generic/table";
import Select from "./generic/select";
import Projections from "./projections";
import getPossibleMedianScores from "./functions/getPossibleMedianScores";
import getPossibleMedianBoB from "./functions/getPossibleMedianBoB";
import getStartValues from "./functions/getStartValues";
const lodash = require('lodash');


export default function Log({axios}){
  const [tournamentSelect, setTournamentSelect] = useState([]);
  const [tournamentScores, setTournamentScores] = useState([]);
  const [tournamentBoB, setTournamentBoB] = useState([]);
  const [projectionsList, setProjectionsList] = useState([]);
  const [checklistStrokes, setChecklistStrokes] = useState([]);
  const [checklistBoB, setChecklistBoB] = useState([]);
  const [logs, setLogs] = useState([]);



  useEffect(() => {
    (async function () {
      try {
        //api
        const selectResult = await axios.get("/api/tournament/select");
        const permNum = selectResult.data[0].Value;
        const scoreResult = await axios.get("/api/tournament/medianscore", { params: {permNum: permNum}});
        const bobResult = await axios.get("/api/tournament/medianbob", { params: {permNum: permNum}});
        const projectionsResult = await axios.get("/api/tournament/getprojections");
        const logResult = await axios.get("/api/logs");
        setTournamentSelect(selectResult.data);
        setTournamentScores(scoreResult.data);
        setTournamentBoB(bobResult.data);
        setProjectionsList(projectionsResult.data);
        setLogs(logResult.data);
        
        //not api
        const possibleMedianScoreRange = getPossibleMedianScores(scoreResult.data);
        const possibleMedianBoBRange = getPossibleMedianBoB(bobResult.data);
        const startValues = getStartValues(scoreResult.data, bobResult.data);
        const scoreRange = lodash.range(possibleMedianScoreRange.Min,possibleMedianScoreRange.Max+1);
        const bobRange = lodash.range(possibleMedianBoBRange.Min,possibleMedianBoBRange.Max+1);
        const scoreRangeChecks = scoreRange.map((value) => (
          {Value: value, Checked: value === startValues.InitialStrokes}
        ));
        const bobRangeChecks = bobRange.map((value) => (
          {Value: value, Checked: value === startValues.InitialBoB}
        ));
        setChecklistStrokes(scoreRangeChecks);
        setChecklistBoB(bobRangeChecks);
      } catch (error) {
        //handleError(error);
      }
    })();
  }, [axios]);

  async function getTournamentStats(permNum) {
    try {
      //api
      const scoreResult = await axios.get("/api/tournament/medianscore", { params: {permNum: permNum}});
      const bobResult = await axios.get("/api/tournament/medianbob", { params: {permNum: permNum}});
      setTournamentScores(scoreResult.data);
      setTournamentBoB(bobResult.data);

      //not api
      const possibleMedianScoreRange = getPossibleMedianScores(scoreResult.data);
      const possibleMedianBoBRange = getPossibleMedianBoB(bobResult.data);
      const startValues = getStartValues(scoreResult.data, bobResult.data);
      const scoreRange = lodash.range(possibleMedianScoreRange.Min,possibleMedianScoreRange.Max+1);
      const bobRange = lodash.range(possibleMedianBoBRange.Min,possibleMedianBoBRange.Max+1);
      const scoreRangeChecks = scoreRange.map((value) => (
        {Value: value, Checked: value === startValues.InitialStrokes}
      ));
      const bobRangeChecks = bobRange.map((value) => (
        {Value: value, Checked: value === startValues.InitialBoB}
      ));
      console.log(scoreRangeChecks)
      setChecklistStrokes(scoreRangeChecks);
      setChecklistBoB(bobRangeChecks);
    } catch (error) {
      //console.error(error.response.data);
    }
  }

  function handleStrokeMedianChange(value){
    const newChecklist = checklistStrokes.map((obj) => (
      {Value: obj.Value, Checked: obj.Checked}
    ));
    const objIndex = newChecklist.findIndex((obj) => obj.Value === value);
    const currentChecked = newChecklist[objIndex].Checked;
    newChecklist[objIndex].Checked = !currentChecked;
    setChecklistStrokes(newChecklist);
  }

  function handleBoBMedianChange(value){
    const newChecklist = checklistBoB.map((obj) => (
      {Value: obj.Value, Checked: obj.Checked}
    ));
    const objIndex = newChecklist.findIndex((obj) => obj.Value === value);
    const currentChecked = newChecklist[objIndex].Checked;
    newChecklist[objIndex].Checked = !currentChecked;
    setChecklistBoB(newChecklist);
  }

  const model = [
    {columnName: 'Year'},
    {columnName: 'R1'},
    {columnName: 'R2'},
    {columnName: 'R3'},
    {columnName: 'R4'},
    {columnName: 'Total'}
  ] 

  const lastUpdatedRecords = logs.filter((log) => {
    return log.Message === 'main finished';
  })
  let pgaLastUpdated = "";
  let prizePicksLastUpdated = "";
  for (const log of lastUpdatedRecords) {
    if (log.Process === 'PGATour'){
      const options = {dateStyle:"medium",timeStyle:"short"}
      pgaLastUpdated = new Date(log.Injected).toLocaleString("en-US", {options});
    }
    if (log.Process === 'PrizePicks'){
      const options = {dateStyle:"medium",timeStyle:"short"}
      prizePicksLastUpdated = new Date(log.Injected).toLocaleString("en-US", {options});
    }
  }
  
  let projectionsView = <Fragment/>
  if (projectionsList.length === 0) {
    projectionsView = <div>PrizePicks PGA lines not listed yet</div>
  } else {
    projectionsView = <Projections checklistBoB={checklistBoB} checklistStrokes={checklistStrokes} projectionsList={projectionsList} />
  }

  return(
    <Fragment>
      <p className="text-end small text-muted mt-1 mb-0">Tournament data last updated: {pgaLastUpdated}</p>
      <p className="text-end small text-muted">Projection data last updated: {prizePicksLastUpdated}</p>
      <Select selectItems={tournamentSelect} label="Tournament" selectId="PermNum" classes="form-control form-control-lg w-auto" handleValueChange={getTournamentStats} />
      <div className="mt-3 row">
        <div className="col-lg-3">
          <Table model={model} data={tournamentScores} label="Strokes" />
          <label>Median Strokes</label>
          <div>
            {checklistStrokes.map((item) => (
              <span className="me-2">
                <input type="checkbox" className="btn-check" id={item.Value} checked={item.Checked} onChange={() => handleStrokeMedianChange(item.Value)} autoComplete="off" />
                <label className="btn btn-outline-primary" htmlFor={item.Value}>{item.Value}</label>
              </span>
            ))}
          </div>
        </div>
        <div className="col-lg-3">
          <Table model={model} data={tournamentBoB} label="Birdies Or Better" />
          <label>Median Birdies Or Better</label>
          <div>
            {checklistBoB.map((item) => (
              <span className="me-2">
                <input type="checkbox" className="btn-check" id={item.Value} checked={item.Checked} onChange={() => handleBoBMedianChange(item.Value)} autoComplete="off" />
                <label className="btn btn-outline-primary" htmlFor={item.Value}>{item.Value}</label>
              </span>
            ))}
          </div>
        </div>
      </div>
      <Projections checklistBoB={checklistBoB} checklistStrokes={checklistStrokes} projectionsList={projectionsList} />
    </Fragment>
  );
}