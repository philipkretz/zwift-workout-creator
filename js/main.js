
function updateDurationText(id,val) {
  $('#'+id).html(' '+val);
}

function calcTotalTime() {
  let warmupLength = $('#warmup-duration').val()*60;
  let cooldownLength = $('#cooldown-duration').val()*60;
  let totalDuration = warmupLength+cooldownLength;
  let sections = window.sections;
  for (let i=0;i<sections.length;i++) {
    if (sections[i] !== null) {
      if (sections[i].type == 'interval') {
        totalDuration += sections[i].intervalCount*(sections[i].intervalLength+sections[i].recoveryLength);
        console.log([sections[i].intervalCount,sections[i].intervalLength,sections[i].recoveryLength]);
      }
      else {
        totalDuration += sections[i].intervalLength;
      }
    }
  }

  let hours = Math.floor(totalDuration / 3600);
  let minutes = Math.floor((totalDuration - hours*60) / 60);
  let seconds = totalDuration - hours*3600 - minutes*60;
  if (seconds<10) seconds = '0'+seconds;
  if (minutes<10) minutes = '0'+minutes;
  if (hours<10) hours = '0'+hours;

  $('#total-time').text(hours+':'+minutes+':'+seconds+'h');
}

function addSection() {
  let sectionType = $('#section-type').children("option:selected").val();
  let intervalCount = $('#section-repeats').val();
  let intervalLength = $('#section-duration').val();
  let recoveryLength = $('#section-recovery').val();
  let intervalSpeed = $('#interval-speed').val();
  let intervalPower = $('#interval-power').val();
  let recoverySpeed = $('#recovery-speed').val();
  let recoveryPower = $('#recovery-power').val();
  window.sections.push({'type' : sectionType, 'intervalCount' : intervalCount*1, 'intervalLength' : intervalLength*1, 'recoveryLength' : recoveryLength*1,
  'intervalSpeed' : intervalSpeed*1, 'intervalPower' : intervalPower*1, 'recoverySpeed' : recoverySpeed*1, 'recoveryPower' : recoveryPower*1 });

  let section = '';
  if ($('#training').children("option:selected").val() == 'run') {
    if (sectionType == 'interval') {
      section = `<li data-id="`+window.sections.length+`" class="list-group-item list-group-item-warning d-flex justify-content-between align-items-center">
        Run-Interval (`+intervalCount+`x `+intervalLength+` sec at `+intervalSpeed+`%, rest `+recoveryLength+` sec at `+recoverySpeed+`%)
        <span class="badge badge-dark badge-pill badge-remove" data-remove-id="`+window.sections.length+`">X</span>
      </li>`;
    }
    else {
      section = `<li data-id="`+window.sections.length+`" class="list-group-item list-group-item-warning d-flex justify-content-between align-items-center">
        Run Steady-State for `+intervalLength+` sec at `+intervalSpeed+`%
        <span class="badge badge-dark badge-pill badge-remove" data-remove-id="`+window.sections.length+`">X</span>
      </li>`;
    }
  }
  else {
    if (sectionType == 'interval') {
      section = `<li data-id="`+window.sections.length+`" class="list-group-item list-group-item-warning d-flex justify-content-between align-items-center">
        Cycle-Interval (`+intervalCount+`x `+intervalLength+` sec at `+intervalPower+`%, rest `+recoveryLength+` sec at `+recoveryPower+`%)
        <span class="badge badge-dark badge-pill badge-remove" data-remove-id="`+window.sections.length+`">X</span>
      </li>`;
    }
    else {
      section = `<li data-id="`+window.sections.length+`" class="list-group-item list-group-item-warning d-flex justify-content-between align-items-center">
        Cycle Steady-State for `+intervalLength+` sec at `+intervalPower+`%
        <span class="badge badge-dark badge-pill badge-remove" data-remove-id="`+window.sections.length+`">X</span>
      </li>`;
    }
  }

  let listItems = $('#training-sections').children('li');
  let cooldownItem = listItems[listItems.length-1];
  $(section).insertBefore(cooldownItem);

  $('.badge-remove').on('click', function() {
    window.sections[$(this).parent().data('id')-1] = null;
    $(this).parent().remove();
    calcTotalTime();
  });

  calcTotalTime();
  $('#toast-add-session').show();
  setTimeout(function() {
    $('#toast-add-session').fadeOut();
  },3000);
}

function generateFile() {
  let trainingType = $('#training').children("option:selected").val();
  let authorName = $('#author-name').val();
  let trainingName = $('#training-name').val();
  let description = $('#description').val();
  let warmupSpeed = $('#warmup-speed').val();
  let warmupPower = $('#warmup-power').val();
  let warmupLength = $('#warmup-duration').val()*60;
  let cooldownSpeed = $('#cooldown-speed').val();
  let cooldownPower = $('#cooldown-power').val();
  let cooldownLength = $('#cooldown-duration').val()*60;
  let warmupPowerLow,warmupPowerHigh,cooldownPowerLow,cooldownPowerHigh;
  let xml = '<workout_file>\n';
  xml += '<author>'+authorName+'</author>\n';
  xml += '<name>'+trainingName+'</name>\n';
  xml += '<description>'+description+'</description>\n';
  if (trainingType == 'run') {
    xml += '<sportType>run</sportType>\n<workout>\n';
    warmupPowerLow = warmupSpeed/100;
    cooldownPowerLow = cooldownSpeed/100;
  }
  else {
    xml += '<sportType>bike</sportType>\n<workout>\n';
    warmupPowerLow = warmupPower/100;
    cooldownPowerLow = cooldownPower/100;
  }
  warmupPowerHigh = warmupPowerLow;
  warmupPowerLow = warmupPowerLow*0.75;
  cooldownPowerHigh = cooldownPowerLow*0.75;
  xml += '<Warmup Duration="'+warmupLength+'" PowerLow="'+warmupPowerLow+'" PowerHigh="'+warmupPowerHigh+'" pace="1">\n';
  xml += '<textevent timeoffset="20" message="Welcome to '+trainingName+' by '+authorName+'!"/>\n';
  xml += '<textevent timeoffset="35" message="'+description+'"/>\n';
  xml += '<textevent timeoffset="'+(warmupLength-60)+'" message="You have nearly finished the warmup. Now prepare mentally for the main set!"/>\n';
  xml += '</Warmup>\n';

  let sections = window.sections;
  for (let i=0;i<sections.length;i++) {
    if (sections[i] !== null) {
      sections[i].intervalSpeed = sections[i].intervalSpeed / 100;
      sections[i].intervalPower = sections[i].intervalPower / 100;
      sections[i].recoverySpeed = sections[i].recoverySpeed / 100;
      sections[i].recoveryPower = sections[i].recoveryPower / 100;
      if (trainingType == 'run') {
        if (sections[i].type == 'interval') {
          xml += '<IntervalsT Repeat="'+sections[i].intervalCount+'" OnDuration="'+sections[i].intervalLength+'" OffDuration="'+sections[i].recoveryLength+
                  '" OnPower="'+sections[i].intervalSpeed+'" OffPower="'+sections[i].recoverySpeed+'" pace="1" />\n';
        }
        else {
          xml += '<SteadyState Duration="'+sections[i].intervalLength+'" Power="'+sections[i].intervalSpeed+'" pace="1" />\n';
        }
      }
      else {
        if (sections[i].type == 'interval') {
          xml += '<IntervalsT Repeat="'+sections[i].intervalCount+'" OnDuration="'+sections[i].intervalLength+'" OffDuration="'+sections[i].recoveryLength+
                  '" OnPower="'+sections[i].intervalPower+'" OffPower="'+sections[i].recoveryPower+'" pace="1" />\n';
        }
        else {
          xml += '<SteadyState Duration="'+sections[i].intervalLength+'" Power="'+sections[i].intervalPower+'" pace="1" />\n';
        }
      }
    }
  }

  xml += '<Cooldown Duration="'+cooldownLength+'" PowerLow="'+cooldownPowerLow+'" PowerHigh="'+cooldownPowerHigh+'" pace="1">\n';
  xml += '<textevent timeoffset="20" message="Congratulations! You got it! Still enjoy the cooldown phase..."/>\n';
  xml += '</Cooldown>\n</workout>\n</workout_file>';

  let path = '';
  if (navigator.appVersion.indexOf('Win') !== -1 || navigator.appVersion.indexOf('Mac') !== -1) {
    path = '/Documents/Zwift/Workouts/';
  }

  $('#save-as-toast').show();
  setTimeout(function() {
    $('#save-as-toast').fadeOut();
  },10000);

  let filename = path+trainingName.toLowerCase().replace(' ','_')+'.zwo';
  window.saveFile(filename,xml);
}

$(document).ready(function(){
  window.sections = [];
  $('#interval-power').prev().show();
  $('#recovery-power').prev().show();
  $('#warmup-power').prev().show();
  $('#cooldown-power').prev().show();
  $('#interval-speed').prev().hide();
  $('#recovery-speed').prev().hide();
  $('#warmup-speed').prev().hide();
  $('#cooldown-speed').prev().hide();
  $('#interval-power').show();
  $('#recovery-power').show();
  $('#warmup-power').show();
  $('#cooldown-power').show();
  $('#interval-speed').hide();
  $('#recovery-speed').hide();
  $('#warmup-speed').hide();
  $('#cooldown-speed').hide();

  $('#warmup-duration').on('change',function() {
    updateDurationText('warmup-duration-text',this.value+' min');
    updateDurationText('warmup-duration-text2',this.value+' min');
    calcTotalTime();
  });
  $('#cooldown-duration').on('change',function() {
    updateDurationText('cooldown-duration-text',this.value+' min');
    updateDurationText('cooldown-duration-text2',this.value+' min');
    calcTotalTime();
  });
  $('#section-repeats').on('change',function() {
    updateDurationText('section-repeats-text',this.value);
  });
  $('#section-duration').on('change',function() {
    updateDurationText('section-duration-text',this.value+' sec');
  });
  $('#section-recovery').on('change',function() {
    updateDurationText('section-recovery-text',this.value+' sec');
  });

  $('.button-back').on('click',function() {
    var page = $(this).data('page');
    $('#input-area-'+page).removeClass('hide');
    $('#input-area-'+(page+1)).addClass('hide');
  });

  $('.button-next').on('click',function() {
    var page = $(this).data('page');
    $('#input-area-'+page).removeClass('hide');
    $('#input-area-'+(page-1)).addClass('hide');
  });

  $('#training').on('change', function() {
    var selectedOption = $(this).children("option:selected").val();
    if (selectedOption == 'run') {
      $('#interval-power').prev().hide();
      $('#recovery-power').prev().hide();
      $('#warmup-power').prev().hide();
      $('#cooldown-power').prev().hide();
      $('#interval-speed').prev().show();
      $('#recovery-speed').prev().show();
      $('#warmup-speed').prev().show();
      $('#cooldown-speed').prev().show();
      $('#interval-power').hide();
      $('#recovery-power').hide();
      $('#warmup-power').hide();
      $('#cooldown-power').hide();
      $('#interval-speed').show();
      $('#recovery-speed').show();
      $('#warmup-speed').show();
      $('#cooldown-speed').show();
    }
    else {
      $('#interval-power').prev().show();
      $('#recovery-power').prev().show();
      $('#warmup-power').prev().show();
      $('#cooldown-power').prev().show();
      $('#interval-speed').prev().hide();
      $('#recovery-speed').prev().hide();
      $('#warmup-speed').prev().hide();
      $('#cooldown-speed').prev().hide();
      $('#interval-power').show();
      $('#recovery-power').show();
      $('#warmup-power').show();
      $('#cooldown-power').show();
      $('#interval-speed').hide();
      $('#recovery-speed').hide();
      $('#warmup-speed').hide();
      $('#cooldown-speed').hide();
    }
  });

  $('#section-type').on('change', function() {
    var selectedOption = $(this).children("option:selected").val();
    if (selectedOption == 'interval') {
      $('#section-repeats').prev().show();
      $('#section-recovery').prev().show();
      $('#section-repeats').show();
      $('#section-recovery').show();
      if ($('#training').children("option:selected").val() == 'run') {
        $('#interval-speed').prev().show();
        $('#recovery-speed').prev().show();
        $('#interval-speed').show();
        $('#recovery-speed').show();
      }
      else {
        $('#interval-power').prev().show();
        $('#recovery-power').prev().show();
        $('#interval-power').show();
        $('#recovery-power').show();
      }
    }
    else {
        $('#section-repeats').prev().hide();
        $('#section-recovery').prev().hide();
        $('#recovery-speed').prev().hide();
        $('#recovery-power').prev().hide();
        $('#section-repeats').hide();
        $('#section-recovery').hide();
        $('#recovery-speed').hide();
        $('#recovery-power').hide();
    }
  });

  $('#button-add-section').on('click', function() {
    addSection();
  });

  $('#button-save').on('click', function() {
    generateFile();
  });
});
